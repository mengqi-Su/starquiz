// ========================================
// StarQuiz 后端函数（Deno Edge Function）
// 能力：
//   POST /judge/run     编程题代码运行（Judge0 代理）
//   POST /ai/start      学习资料 -> 启动出题任务（站点内置 Qoder AI），立即返回会话 ID
//   POST /ai/poll       轮询出题任务，拿到完整题目后返回题库
// ========================================

import { MAX_AI_OUTPUT_CHARS, pollQoderGeneration, QcaError, qoderConfigured, startQoderGeneration } from './qca-ai.ts';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function fail(code: string, message: string, status = 400): Response {
  return json({ ok: false, error: { code, message } }, status);
}

async function readJsonBody(req: Request, maxBytes = 256 * 1024): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) {
    throw new Error('body_too_large');
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('bad_body');
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error('bad_body');
  }
}

/* ---------------- Judge0 ---------------- */

const JUDGE0_LANG_IDS: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  python: 71,     // Python 3.8.1
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62        // Java (OpenJDK 13)
};

function judge0Config() {
  const base = (Deno.env.get('JUDGE0_URL') || 'https://ce.judge0.com').replace(/\/+$/, '');
  const key = Deno.env.get('JUDGE0_KEY') || '';
  const token = Deno.env.get('JUDGE0_TOKEN') || '';
  return { base, key, token };
}

function judge0Headers(base: string, key: string, token: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key && base.includes('rapidapi.com')) {
    headers['X-RapidAPI-Key'] = key;
    headers['X-RapidAPI-Host'] = new URL(base).host;
  } else if (token) {
    headers['X-Auth-Token'] = token;
  }
  return headers;
}

async function handleJudge(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 128 * 1024);
  } catch (e) {
    return fail('invalid_request', e instanceof Error && e.message === 'body_too_large' ? '提交内容过大' : '请求格式错误');
  }

  const language = String(body.language || '');
  const source = String(body.source || '');
  const stdin = String(body.stdin || '');

  const langId = JUDGE0_LANG_IDS[language];
  if (!langId) return fail('invalid_request', '不支持的编程语言');
  if (!source.trim()) return fail('invalid_request', '代码不能为空');
  if (source.length > 100_000) return fail('invalid_request', '代码过长');
  if (stdin.length > 10_000) return fail('invalid_request', '输入过长');

  const { base, key, token } = judge0Config();

  let resp: Response;
  try {
    resp = await fetch(`${base}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: judge0Headers(base, key, token),
      body: JSON.stringify({
        source_code: source,
        language_id: langId,
        stdin,
        cpu_time_limit: 5,
        memory_limit: 128000
      }),
      signal: AbortSignal.timeout(25_000)
    });
  } catch {
    return fail('judge_unavailable', '判题服务连接失败，请稍后重试', 502);
  }

  if (!resp.ok) {
    return fail('judge_failed', `判题服务返回错误（${resp.status}）`, 502);
  }

  const data = await resp.json().catch(() => null) as Record<string, unknown> | null;
  if (!data) return fail('judge_failed', '判题服务返回异常数据', 502);

  const status = (data.status || {}) as Record<string, unknown>;
  const clip = (v: unknown, n = 20000) => String(v ?? '').slice(0, n);

  return json({
    ok: true,
    result: {
      stdout: clip(data.stdout),
      stderr: clip(data.stderr),
      compileOutput: clip(data.compile_output),
      message: clip(data.message, 2000),
      statusId: Number(status.id ?? 0),
      statusDescription: clip(status.description, 200),
      time: clip(data.time, 40),
      memory: Number(data.memory ?? 0)
    }
  });
}

/* ---------------- AI 出题 ---------------- */

const TYPE_RULES: Record<string, string> = {
  mixed: '题型混合：约 50% 单选、20% 多选、15% 判断、15% 填空，不要生成编程题',
  choice: '只生成单选题（type 为 single），每题 4 个选项',
  'with-code': '包含选择题和编程题：至少 1 道编程题（type 为 code）'
};

// 题量规则：与前端 web/app.js 的 aiCountRange 保持一致
// 约每 120 字可支撑 1 题，建议按每 300 字 1 题出题，范围 3-40 题
function countRangeFor(material: string) {
  const chars = material.replace(/\s/g, '').length;
  const min = 3;
  const max = Math.max(min, Math.min(40, Math.floor(chars / 120)));
  const recommended = Math.max(min, Math.min(max, Math.round(chars / 300)));
  return { chars, min, max, recommended };
}

// 联动聚焦出题：考点标题是浏览器传来的不可信文本，只作为提示词内容，
// 长度截断、剥掉控制字符，绝不参与任何路径、身份或判分逻辑。
const FOCUS_MAX_CHARS = 400;

function focusTopicFrom(body: Record<string, unknown>): string {
  // 只接受字符串：对象/数字一律当成没有考点，避免把 "[object Object]" 之类的噪声塞进提示词
  if (typeof body.focusTopic !== 'string') return '';
  return body.focusTopic
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, FOCUS_MAX_CHARS);
}

function buildPrompt(material: string, count: number, types: string, codeLanguage: string | null, focus = ''): string {
  const codeLang = types === 'with-code' ? (codeLanguage === 'javascript' ? 'javascript' : 'python') : '';
  const kpCount = Math.max(3, Math.min(12, Math.ceil(count / 3)));
  const scopeRule = focus
    ? `2. 全部题目只围绕考点「${focus}」出题；这份资料如果覆盖不到这个考点，就少出题，绝不扩展到无关考点，也不得改写考点名称。\n   知识点（knowledgePoints）只返回 1 个，title 必须原样使用「${focus}」，每道题的 knowledgePointId 必须是 "kp1"。`
    : `2. 题目要覆盖资料中的不同知识点，避免重复考同一个细节；每个知识点最多出 4 道题。`;
  const kpRule = focus
    ? '5. 只返回上面规定的这 1 个知识点，题目全部归属它。'
    : `5. 生成约 ${kpCount} 个知识点（knowledgePoints，不超过 12 个），每道题通过 knowledgePointId 关联其中一个知识点。`;
  return `你是一位严谨的出题专家。请根据下面提供的学习资料，生成 ${count} 道高质量的练习题。

## 资料
${material}

## 要求
1. ${TYPE_RULES[types] || TYPE_RULES.mixed}
${scopeRule}
3. 题目必须完全基于资料内容，不要编造资料以外的知识点。资料篇幅足够时必须出满 ${count} 道；只有资料确实不足时才可少出，并在解析里不要提及题量。
4. 每道题必须有明确的正确答案和简短的解析（explanation）。
${kpRule}
6. 题目难度 difficulty 取 1-3 的整数，整体难度分布均匀。
7. 所有文本使用与资料相同的语言（中文资料用中文出题）。
8. 输出尽量精简：题干不超过 80 字，选项不超过 20 字，解析不超过 40 字，知识点讲解不超过 60 字，不要复述大段资料原文。
9. 题目按知识点顺序排列，同一知识点的题目放在一起；不要遗漏资料中的重点内容。

## 编程题要求（如果包含编程题）
- 语言固定为 "${codeLang}"。
- 提供 template（初始代码模板）和 answer（参考实现）。
- 提供 2-3 个 testCases，每个包含 input 和 expectedOutput。
- input 必须是一行可直接追加到用户代码后运行、且会打印输出的语句（例如 Python: print(fn(...))；JavaScript: console.log(fn(...))）。
- expectedOutput 必须是该语句运行后精确的 stdout（不含多余空行）。
- 编程题难度适中，适合学习资料对应的水平。

${outputSchema(codeLang)}
`;
}

// 真题模式：忠实还原原题，不生成、不改写，题量不设上限
// 资料较长时按题目起始位置切段并行整理，避免单次输出过长导致等待数分钟
const EXAM_PART_TARGET = 9000;
const EXAM_MAX_PARTS = 3;
const EXAM_MIN_PART = 600;

// 混合批量模式：笔记 + 真题一次上传，笔记切段出题、真题逐题整理，再合并成一个题库
const NOTE_PART_TARGET = 12000;
const NOTE_MAX_CHARS = 24000;
const BATCH_EXAM_MAX_CHARS = 48000;
const BATCH_MAX_SESSIONS = 5;

function examQuestionStarts(material: string): number[] {
  const starts: number[] = [];
  let offset = 0;
  const startRe = /^\s*(?:第\s*)?[0-9０-９]{1,3}\s*[.、．)）]/;
  for (const line of material.split('\n')) {
    if (startRe.test(line) && line.replace(/\s/g, '').length > 4) starts.push(offset);
    offset += line.length + 1;
  }
  return starts;
}

function splitExamParts(material: string, maxParts = EXAM_MAX_PARTS): string[] {
  const len = material.length;
  const starts = examQuestionStarts(material);
  // 生成耗时主要取决于题目数量（输出长度），所以按题数估算分段，而不只看字符数
  const byCount = starts.length >= 18 ? Math.ceil(starts.length / 14) : 0;
  const byChars = Math.ceil(len / EXAM_PART_TARGET);
  const desired = Math.min(Math.max(2, maxParts), Math.max(2, byCount, byChars));
  if (starts.length < desired || len < EXAM_MIN_PART * desired) return [material];

  const cuts: number[] = [];
  let cursor = 0;
  for (let i = 1; i < desired; i++) {
    const reserve = EXAM_MIN_PART * (desired - i);
    const target = starts[Math.round((starts.length * i) / desired)] ?? Math.round((len * i) / desired);
    let best = -1;
    for (const start of starts) {
      if (start < cursor + EXAM_MIN_PART || start > len - reserve) continue;
      if (best < 0 || Math.abs(start - target) < Math.abs(best - target)) best = start;
    }
    if (best < 0) continue;
    cuts.push(best);
    cursor = best;
  }
  if (!cuts.length) return [material];

  const parts: string[] = [];
  let prev = 0;
  for (const cut of cuts) {
    parts.push(material.slice(prev, cut));
    prev = cut;
  }
  parts.push(material.slice(prev));
  return parts.filter((part) => part.trim().length >= 50);
}

// 笔记按段落切成不超过 12000 字的两段，分别出题，避免单次输出过长
function splitNoteParts(material: string): string[] {
  if (material.length <= NOTE_PART_TARGET) return [material];
  const boundaries: number[] = [];
  for (let i = 0; i < material.length - 1; i++) {
    if (material[i] === '\n' && material[i + 1] === '\n') boundaries.push(i);
  }
  if (!boundaries.length) {
    for (let i = 0; i < material.length; i++) if (material[i] === '\n') boundaries.push(i);
  }

  const desired = Math.min(2, Math.ceil(material.length / NOTE_PART_TARGET));
  const cuts: number[] = [];
  let cursor = 0;
  for (let i = 1; i < desired; i++) {
    const target = Math.round((material.length * i) / desired);
    let best = -1;
    for (const b of boundaries) {
      if (b < cursor + 800 || b > material.length - 500) continue;
      if (best < 0 || Math.abs(b - target) < Math.abs(best - target)) best = b;
    }
    if (best >= 0) {
      cuts.push(best);
      cursor = best;
    }
  }
  if (!cuts.length) return [material];

  const parts: string[] = [];
  let prev = 0;
  for (const cut of cuts) {
    parts.push(material.slice(prev, cut));
    prev = cut;
  }
  parts.push(material.slice(prev));
  return parts.filter((part) => part.trim().length >= 50);
}

// 把总题量按篇幅比例分配到各段，每段至少 2 题
function distributeCount(total: number, parts: string[]): number[] {
  const weights = parts.map((part) => Math.max(1, part.replace(/\s/g, '').length));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const counts = weights.map((w) => Math.max(2, Math.floor((total * w) / sum)));
  let diff = total - counts.reduce((a, b) => a + b, 0);
  for (let guard = 0; diff !== 0 && guard < 200; guard++) {
    const index = guard % counts.length;
    if (diff > 0) {
      counts[index] += 1;
      diff -= 1;
    } else if (counts[index] > 2) {
      counts[index] -= 1;
      diff += 1;
    }
  }
  return counts;
}

interface BatchDoc {
  name: string;
  kind: 'note' | 'exam';
  material: string;
}

function parseBatchDocuments(body: Record<string, unknown>): BatchDoc[] {
  const raw = Array.isArray(body.documents) ? body.documents : [];
  return raw
    .slice(0, 8)
    .map((item) => {
      const doc = (item || {}) as Record<string, unknown>;
      return {
        name: String(doc.name || '资料').slice(0, 80),
        kind: doc.kind === 'exam' ? 'exam' as const : 'note' as const,
        material: String(doc.material || '').trim()
      };
    })
    .filter((doc) => doc.material.length >= 20);
}

function joinBatchDocs(docs: BatchDoc[], label: string): string {
  if (docs.length === 1) return docs[0].material;
  return docs.map((doc) => `【${label}：${doc.name}】\n${doc.material}`).join('\n\n');
}

function buildExamPrompt(material: string, part?: { index: number; total: number; overlap: string }, collection = false): string {
  const splitNote = part
    ? `
## 分段说明
这份试卷较长，已按题目顺序切分为 ${part.total} 段，你现在整理第 ${part.index} 段。
只整理"本段题目"里的题目，按原文顺序，一道都不能少；不要整理"前文参考"里的题目，也不要输出其他段的题目。
知识点给 2-4 个即可，name 使用整份试卷的标题（不要写成"第 X 段"）。
`
    : '';
  const collectionNote = collection
    ? `
## 资料说明
这批资料合并了多份真题/试卷，每份都以【试卷：文件名】开头。请把所有试卷的题目全部整理，一份都不能漏。
`
    : '';
  const overlapNote = part && part.overlap
    ? `
## 前文参考（只用于理解题意，绝对不要整理其中的题目）
${part.overlap}
`
    : '';
  return `你是一名严谨的试卷整理助手。下面是一份真题、试卷或题库资料，请把它完整整理成结构化题库，用于刷题。
${collectionNote}${splitNote}
## 资料
${material}
${overlapNote}
## 要求
1. 忠实录入资料中的每一道题，一道都不能少、不能合并、不能删减；不要新增资料里没有的题目，也不要改写题干和选项，只做必要的排版清理。
2. questions 按原文顺序排列，数量不设上限，资料里有多少题就输出多少题。
3. 根据原文判断题型：单选 single，多选 multi，判断 tf，填空 fill；原文中的简答题、论述题、名词解释转为 fill，题干保留原题，answer 保留参考答案要点，题干末尾可加"（简答）"标注。如果原文是编程题，用 code。
4. 原文给出答案、解析的，必须与原文一致并完整保留；原文没有答案的，请根据题目内容给出参考答案，并在 explanation 里简短写明依据。
5. 选择题必须保留全部选项和原始顺序。答案格式：单选是选项索引（从 0 开始），多选是索引数组，判断题是布尔值，填空题和简答题是字符串数组。
6. 生成 ${part ? '2-4' : '3-8'} 个知识点（knowledgePoints），按原文的章节或大题归类，每道题通过 knowledgePointId 关联；绝不能因为知识点数量而删题或合并题目。
7. 在 description 里注明这是整理自原试卷的题库；tags 使用资料中的学科和大题名称。
8. 不要输出"共 N 题"之类的统计文字，不要在 JSON 前后输出任何解释。

${outputSchema('python')}`;
}


// 统一的 JSON 输出结构说明
function outputSchema(codeLang: string): string {
  return `## 输出格式
只输出一个 JSON 对象，不要输出 Markdown 代码块、解释或任何多余文字。结构如下（实际输出请紧凑成一行，不要缩进换行，以减少生成时间）：
{
  "name": "题库名称（简洁，不超过 20 字）",
  "description": "一句话描述这个题库覆盖的内容",
  "icon": "一个 emoji",
  "tags": ["标签1", "标签2"],
  "knowledgePoints": [
    { "id": "kp1", "title": "知识点标题", "content": "知识点讲解，2-3 句话" }
  ],
  "questions": [
    { "type": "single", "difficulty": 1, "knowledgePointId": "kp1", "content": "题干", "options": ["选项A", "选项B", "选项C", "选项D"], "answer": 0, "explanation": "解析" },
    { "type": "multi", "difficulty": 2, "knowledgePointId": "kp2", "content": "题干", "options": ["选项A", "选项B", "选项C", "选项D"], "answer": [0, 2], "explanation": "解析" },
    { "type": "tf", "difficulty": 1, "knowledgePointId": "kp1", "content": "判断陈述", "answer": true, "explanation": "解析" },
    { "type": "fill", "difficulty": 2, "knowledgePointId": "kp3", "content": "填空题干，用 ______ 表示空", "answer": ["答案"], "explanation": "解析" },
    { "type": "code", "difficulty": 2, "knowledgePointId": "kp4", "language": "${codeLang || 'python'}", "content": "编程题描述", "template": "初始代码", "answer": "参考实现", "testCases": [{ "input": "print(fn(...))", "expectedOutput": "预期输出" }], "explanation": "思路解析" }
  ]
}

注意：answer 对单选题是选项索引（从 0 开始），对多选题是索引数组，对判断题是布尔值，对填空题是字符串数组。`;
}

// 容错解析：去掉围栏和零宽字符，截取最外层对象，修掉尾逗号这类常见小毛病
function extractJson(text: string): unknown {
  let s = String(text || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
  }
}

const QUALITY_ISSUE_LIMIT = 30;
const QUIZ_TYPES = new Set(['single', 'multi', 'tf', 'fill', 'code']);

// 模型偶尔给错题型名，按选项和答案形状推断，避免整题被丢掉
function inferType(item: Record<string, unknown>): string {
  const declared = String(item.type || '');
  if (QUIZ_TYPES.has(declared)) return declared;
  const options = Array.isArray(item.options) ? item.options.map((o) => String(o).trim()) : [];
  const answer = item.answer;
  if (options.length) {
    const tfOptions = options.length === 2
      && options.every((o) => /^(正确|错误|对|错|是|否|true|false|√|×)$/i.test(o));
    if (tfOptions) return 'tf';
    if (Array.isArray(answer) && answer.length > 1) return 'multi';
    return 'single';
  }
  if (typeof answer === 'boolean') return 'tf';
  if (/^(正确|错误|对|错|true|false)$/i.test(String(answer ?? '').trim())) return 'tf';
  return 'fill';
}

// 去重归一化：全角转半角、去空白和标点，只留语义字符
function normalizeForDedupe(text: string): string {
  return String(text || '')
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\u3000\u00a0\s]/g, '')
    .toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》〈〉·—…\-_.,!?;:()\[\]{}"'`~@#$%^&*+=|\\/<>]/g, '');
}

function bigrams(text: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < text.length - 1; i++) set.add(text.slice(i, i + 2));
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const gram of a) if (b.has(gram)) inter++;
  return inter / (a.size + b.size - inter);
}

// 近似判重：完全一致直接判重；较长题干用二元组 Jaccard，短题干只认完全一致
function isNearDuplicate(a: string, b: string): boolean {
  const na = normalizeForDedupe(a);
  const nb = normalizeForDedupe(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length < 18 || nb.length < 18) return false;
  if (Math.abs(na.length - nb.length) > Math.max(na.length, nb.length) * 0.4) return false;
  if (jaccard(bigrams(na), bigrams(nb)) >= 0.86) return true;
  const [small, large] = na.length <= nb.length ? [na, nb] : [nb, na];
  return small.length / large.length >= 0.85 && large.includes(small);
}

function halfWidth(value: string): string {
  return value.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

// 选择题答案：支持 0-7、\"A\"、\"A,C\"、[\"A\",\"C\"] 等写法
function choiceIndex(value: unknown, optionCount: number): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 && value < optionCount ? value : null;
  }
  if (typeof value !== 'string') return null;
  const s = halfWidth(value).trim().replace(/[.、．)）:：\s]/g, '').toUpperCase();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return n >= 0 && n < optionCount ? n : null;
  }
  if (s.length === 1) {
    const idx = 'ABCDEFGH'.indexOf(s);
    return idx >= 0 && idx < optionCount ? idx : null;
  }
  return null;
}

function choiceList(value: unknown, optionCount: number): number[] | null {
  const raw = Array.isArray(value) ? value : (typeof value === 'string' && /[,，、;；\s]/.test(value) ? value.split(/[,，、;；\s]+/) : [value]);
  const out: number[] = [];
  for (const item of raw) {
    const idx = choiceIndex(item, optionCount);
    if (idx == null) continue;
    if (!out.includes(idx)) out.push(idx);
  }
  if (!out.length) return null;
  return out.sort((a, b) => a - b);
}

function tfValue(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  const s = halfWidth(String(value ?? '')).trim().toLowerCase();
  if (['true', 't', '对', '正确', '是', '√', 'y', 'yes'].includes(s)) return true;
  if (['false', 'f', '错', '错误', '否', '×', 'x', 'n', 'no'].includes(s)) return false;
  return null;
}

// 选项自带 "A." 前缀时统一剥掉，前端会自己渲染字母
function cleanOptions(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim().slice(0, 300)).filter(Boolean).slice(0, 8)
    : [];
  if (list.length < 2) return list;
  const prefix = /^[A-HＡ-Ｈ]\s*[.、．)）:：]\s*/;
  if (list.every((item) => prefix.test(item))) {
    return list.map((item) => item.replace(prefix, '').trim()).filter(Boolean);
  }
  return list;
}

function fillAnswers(value: unknown): string[] | null {
  const list = Array.isArray(value) ? value.map((item) => String(item ?? '').trim()) : [String(value ?? '').trim()];
  const cleaned = list.filter(Boolean);
  return cleaned.length ? cleaned : null;
}

interface QualityIssue {
  index: number;
  kind: string;
  message: string;
  question: string;
}

function sanitizeSet(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') throw new Error('bad_set');
  const r = raw as Record<string, unknown>;
  const name = String(r.name || 'AI 生成题库').slice(0, 40);
  const questions = Array.isArray(r.questions) ? r.questions : [];
  if (!questions.length) throw new Error('bad_set');

  const issues: QualityIssue[] = [];
  const addIssue = (index: number, kind: string, message: string, content: unknown) => {
    if (issues.length >= QUALITY_ISSUE_LIMIT) return;
    issues.push({ index, kind, message, question: String(content || '').slice(0, 40) });
  };

  const seen: Array<{ text: string; index: number }> = [];
  const cleanedQuestions: Array<Record<string, unknown>> = [];
  let duplicates = 0;
  let removed = 0;
  let repaired = 0;

  questions.forEach((q, i) => {
    const no = i + 1;
    if (!q || typeof q !== 'object') {
      removed++;
      addIssue(no, 'drop', '不是有效的题目结构，已移除', '');
      return;
    }
    const item = q as Record<string, unknown>;
    const content = String(item.content || '').trim().slice(0, 2000);
    if (!content) {
      removed++;
      addIssue(no, 'drop', '缺少题干，已移除', '');
      return;
    }

    const dup = seen.find((prev) => isNearDuplicate(content, prev.text));
    if (dup) {
      duplicates++;
      addIssue(no, 'duplicate', `与第 ${dup.index} 题重复，已合并`, content);
      return;
    }

    const declaredType = String(item.type || '');
    const type = inferType(item);
    if (!QUIZ_TYPES.has(declaredType)) {
      repaired++;
      addIssue(no, 'type', `题型无法识别，按${type === 'tf' ? '判断题' : type === 'fill' ? '填空题' : type === 'multi' ? '多选题' : '单选题'}处理`, content);
    }

    const question: Record<string, unknown> = {
      type,
      difficulty: Math.min(3, Math.max(1, Number(item.difficulty) || 2)),
      knowledgePointId: item.knowledgePointId ?? null,
      content,
      explanation: String(item.explanation || '').slice(0, 1000)
    };

    if (type === 'single' || type === 'multi') {
      const options = cleanOptions(item.options);
      if (options.length < 2) {
        removed++;
        addIssue(no, 'options', '选项不足 2 个，已移除', content);
        return;
      }
      question.options = options;
      if (type === 'single') {
        const idx = choiceIndex(item.answer, options.length);
        if (idx == null) {
          removed++;
          addIssue(no, 'answer', '正确答案无法识别，已移除', content);
          return;
        }
        question.answer = idx;
      } else {
        const list = choiceList(item.answer, options.length);
        if (!list) {
          removed++;
          addIssue(no, 'answer', '正确答案无法识别，已移除', content);
          return;
        }
        if (list.length < 2) addIssue(no, 'answer', '多选只有一个正确选项，请留意', content);
        question.answer = list;
      }
    } else if (type === 'tf') {
      const value = tfValue(item.answer);
      if (value == null) {
        removed++;
        addIssue(no, 'answer', '判断题答案无法识别，已移除', content);
        return;
      }
      question.answer = value;
    } else if (type === 'fill') {
      const answers = fillAnswers(item.answer);
      if (!answers) {
        removed++;
        addIssue(no, 'answer', '参考答案为空，已移除', content);
        return;
      }
      question.answer = answers;
    } else {
      const tests = Array.isArray(item.testCases)
        ? item.testCases.slice(0, 4).map((t) => ({
            input: String((t as Record<string, unknown>)?.input ?? '').slice(0, 1000),
            expectedOutput: String((t as Record<string, unknown>)?.expectedOutput ?? '').slice(0, 1000)
          })).filter((t) => t.input)
        : [];
      if (!tests.length) addIssue(no, 'code', '编程题缺少测试用例', content);
      question.language = item.language === 'javascript' ? 'javascript' : 'python';
      question.template = String(item.template ?? '').slice(0, 5000);
      question.answer = String(item.answer ?? '').slice(0, 5000);
      question.testCases = tests;
    }

    if (!String(question.explanation || '').trim()) addIssue(no, 'explanation', '缺少解析', content);

    seen.push({ text: content, index: no });
    cleanedQuestions.push(question);
  });

  if (!cleanedQuestions.length) throw new Error('bad_set');

  // 知识点按标题去重，最多 12 个；题目关联不到时退回第一个
  const knowledgePoints: Array<Record<string, unknown>> = [];
  const byTitle = new Map<string, string>();
  const rawKps = Array.isArray(r.knowledgePoints) ? r.knowledgePoints : [];
  for (const kp of rawKps) {
    if (!kp || typeof kp !== 'object' || knowledgePoints.length >= 12) continue;
    const title = String((kp as Record<string, unknown>).title || `知识点 ${knowledgePoints.length + 1}`).slice(0, 60);
    const key = normalizeForDedupe(title);
    if (key && byTitle.has(key)) continue;
    const id = `kp${knowledgePoints.length + 1}`;
    knowledgePoints.push({
      id,
      title,
      content: String((kp as Record<string, unknown>).content || '').slice(0, 800)
    });
    if (key) byTitle.set(key, id);
  }

  const keptIds = new Set(knowledgePoints.map((kp) => kp.id));
  const firstKp = knowledgePoints[0]?.id ?? null;
  for (const question of cleanedQuestions) {
    const linked = String(question.knowledgePointId ?? '');
    question.knowledgePointId = keptIds.has(linked) ? linked : firstKp;
  }

  return {
    name,
    description: String(r.description || '').slice(0, 200),
    icon: String(r.icon || '📘').slice(0, 8),
    tags: Array.isArray(r.tags) ? r.tags.map((t) => String(t).slice(0, 20)).slice(0, 6) : [],
    knowledgePoints,
    questions: cleanedQuestions,
    quality: {
      parsed: questions.length,
      kept: cleanedQuestions.length,
      duplicates,
      removed,
      repaired,
      issues
    }
  };
}

interface BatchJob {
  group: 'note' | 'exam';
  label: string;
  prompt: string;
  expected: number;
}

interface BatchJobPlan {
  noteParts: string[];
  counts: number[];
  types: string;
  codeLanguage: string | null;
  examParts: string[];
  examSplit: boolean;
  multiExamDocs: boolean;
  focus: string;
}

/**
 * 把混合资料排成实际发给 AI 的任务列表。
 *
 * 抽成纯函数是为了能直接断言联动约束的落点：focusTopic 只进笔记段，
 * 真题段永远走原样整理提示词，绝不为了归属到某个考点而改写或强行归类原题。
 */
function planBatchJobs(plan: BatchJobPlan): BatchJob[] {
  const jobs: BatchJob[] = [];
  plan.noteParts.forEach((part, index) => {
    jobs.push({
      group: 'note',
      label: plan.noteParts.length > 1 ? `笔记第 ${index + 1} 段` : '笔记出题',
      // 聚焦只作用于笔记生成的那几段：每段都用同一条考点约束
      prompt: buildPrompt(part, plan.counts[index], plan.types, plan.codeLanguage, plan.focus),
      expected: 0
    });
  });
  plan.examParts.forEach((part, index) => {
    jobs.push({
      group: 'exam',
      label: plan.examSplit ? `真题第 ${index + 1} 段` : '真题整理',
      expected: examQuestionStarts(part).length,
      // 真题原文整理不受联动考点影响：不能为了归属而改写或强行归类原题
      prompt: buildExamPrompt(
        part,
        plan.examSplit
          ? {
              index: index + 1,
              total: plan.examParts.length,
              overlap: index > 0 ? plan.examParts[index - 1].slice(-600) : ''
            }
          : undefined,
        plan.multiExamDocs
      )
    });
  });
  return jobs;
}

async function handleAIBatch(
  body: Record<string, unknown>,
  types: string,
  codeLanguage: string | null,
  focus = ''
): Promise<Response> {
  const docs = parseBatchDocuments(body);
  const noteDocs = docs.filter((doc) => doc.kind === 'note');
  const examDocs = docs.filter((doc) => doc.kind === 'exam');
  if (!noteDocs.length || !examDocs.length) {
    return fail('invalid_request', '混合整理需要同时包含笔记和真题');
  }

  const noteMaterial = joinBatchDocs(noteDocs, '笔记');
  const examMaterial = joinBatchDocs(examDocs, '试卷');
  if (noteMaterial.length > NOTE_MAX_CHARS) {
    return fail('invalid_request', `笔记资料超过 ${NOTE_MAX_CHARS.toLocaleString()} 字符，请分两次上传`);
  }
  if (examMaterial.length > BATCH_EXAM_MAX_CHARS) {
    return fail('invalid_request', `真题资料超过 ${BATCH_EXAM_MAX_CHARS.toLocaleString()} 字符，请分两次上传`);
  }
  if (noteMaterial.replace(/\s/g, '').length < 50) return fail('invalid_request', '笔记内容太短（至少 50 字）');
  if (examMaterial.replace(/\s/g, '').length < 50) return fail('invalid_request', '真题内容太短（至少 50 字）');

  const range = countRangeFor(noteMaterial);
  const requested = Number(body.count);
  const totalCount = Number.isFinite(requested) && requested > 0
    ? Math.min(range.max, Math.max(range.min, Math.round(requested)))
    : range.recommended;

  let noteParts = splitNoteParts(noteMaterial);
  if (noteParts.length > 1 && totalCount < 6) noteParts = [noteMaterial];
  const counts = distributeCount(totalCount, noteParts);

  // 全部会话控制在 5 个以内，避免并发过多反而被上游排队拖慢
  const examBudget = Math.max(2, Math.min(EXAM_MAX_PARTS, BATCH_MAX_SESSIONS - noteParts.length));
  const examParts = splitExamParts(examMaterial, examBudget);
  const examSplit = examParts.length > 1;

  const jobs = planBatchJobs({
    noteParts,
    counts,
    types,
    codeLanguage,
    examParts,
    examSplit,
    multiExamDocs: examDocs.length > 1,
    focus
  });

  try {
    const ids = await Promise.all(jobs.map((job) => startQoderGeneration(job.prompt)));
    return json({
      ok: true,
      mode: 'batch',
      sessionId: ids[0],
      sessions: jobs.map((job, index) => ({ id: ids[index], index, group: job.group, label: job.label, expected: job.expected })),
      parts: ids.length,
      noteParts: noteParts.length,
      examParts: examParts.length,
      count: totalCount
    });
  } catch (error) {
    if (error instanceof QcaError) return fail(error.code, error.message, error.status);
    return fail('ai_unavailable', 'Qoder AI 暂时不可用，请稍后重试', 502);
  }
}

async function handleAIStart(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 512 * 1024);
  } catch (e) {
    return fail('invalid_request', e instanceof Error && e.message === 'body_too_large' ? '资料内容过大' : '请求格式错误');
  }

  const modeRaw = String(body.mode || 'generate');
  const mode = modeRaw === 'exam' ? 'exam' : (modeRaw === 'batch' ? 'batch' : 'generate');
  const types = String(body.types || 'mixed');
  const codeLanguage = types === 'with-code' ? String(body.codeLanguage || 'python') : null;

  if (!(types in TYPE_RULES)) return fail('invalid_request', '不支持的题型设置');
  if (codeLanguage && codeLanguage !== 'python' && codeLanguage !== 'javascript') {
    return fail('invalid_request', '不支持的编程语言');
  }
  if (mode === 'batch') return await handleAIBatch(body, types, codeLanguage, focusTopicFrom(body));

  // 真题模式没有 focusTopic：原样整理不允许为了联动考点而改写或强行归类
  const focus = mode === 'exam' ? '' : focusTopicFrom(body);

  const material = String(body.material || '').trim();
  if (mode === 'exam' && material.length > 48000) {
    return fail('invalid_request', '真题资料过长，请拆分成 48000 字符以内再整理，避免漏题');
  }
  if (mode === 'generate' && material.length > 24000) {
    return fail('invalid_request', '资料过长，请控制在 24000 字符以内');
  }

  const range = countRangeFor(material);
  if (range.chars < 50) return fail('invalid_request', '资料内容太短（至少 50 字）');

  // 出题模式：题量与资料篇幅挂钩；真题模式：由 AI 按原文逐题整理，不设题量上限
  let count = 0;
  if (mode === 'generate') {
    const requested = Number(body.count);
    count = Number.isFinite(requested) && requested > 0
      ? Math.min(range.max, Math.max(range.min, Math.round(requested)))
      : range.recommended;
  }

  const prompt = mode === 'exam' ? buildExamPrompt(material) : buildPrompt(material, count, types, codeLanguage, focus);

  try {
    // 真题较长时切段并行整理：每段一个会话同时跑，墙钟时间约为单段的耗时
    if (mode === 'exam') {
      const parts = splitExamParts(material);
      if (parts.length > 1) {
        const prompts = parts.map((part, index) =>
          buildExamPrompt(part, {
            index: index + 1,
            total: parts.length,
            overlap: index > 0 ? parts[index - 1].slice(-600) : ''
          })
        );
        const ids = await Promise.all(prompts.map((item) => startQoderGeneration(item)));
        return json({
          ok: true,
          sessionId: ids[0],
          sessions: ids.map((id, index) => ({
            id,
            index,
            group: 'exam',
            label: `真题第 ${index + 1} 段`,
            expected: examQuestionStarts(parts[index]).length
          })),
          parts: ids.length,
          count: 0,
          mode
        });
      }
    }

    const sessionId = await startQoderGeneration(prompt);
    return json({
      ok: true,
      sessionId,
      sessions: [{
        id: sessionId,
        index: 0,
        group: mode === 'exam' ? 'exam' : 'note',
        label: mode === 'exam' ? '真题整理' : '',
        expected: mode === 'exam' ? examQuestionStarts(material).length : 0
      }],
      parts: 1,
      count,
      mode
    });
  } catch (error) {
    if (error instanceof QcaError) return fail(error.code, error.message, error.status);
    return fail('ai_unavailable', 'Qoder AI 暂时不可用，请稍后重试', 502);
  }
}

// 轮询接口：函数不保存任务状态，只把会话里的增量事件转成结果返回
async function handleAIPoll(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 4 * 1024);
  } catch {
    return fail('invalid_request', '请求格式错误');
  }

  try {
    const snapshot = await pollQoderGeneration(String(body.sessionId || ''));
    if (!snapshot.messages.length) {
      return json({ ok: true, done: false, statuses: snapshot.statuses, errors: snapshot.errors });
    }

    const output = snapshot.messages[snapshot.messages.length - 1].text;
    if (output.length > MAX_AI_OUTPUT_CHARS) {
      return fail('ai_bad_output', 'AI 返回内容过大，请减少题量后重试', 502);
    }

    let set: Record<string, unknown>;
    try {
      set = sanitizeSet(extractJson(output));
    } catch {
      return fail('ai_bad_output', 'AI 返回的题目格式不正确，请重试', 502);
    }
    return json({ ok: true, done: true, set });
  } catch (error) {
    if (error instanceof QcaError) return fail(error.code, error.message, error.status);
    return fail('ai_unavailable', 'Qoder AI 暂时不可用，请稍后重试', 502);
  }
}

/* ---------------- 路由 ---------------- */

// 供本地测试直接调用的纯函数（生产路径不依赖这些导出）
export { buildExamPrompt, buildPrompt, examQuestionStarts, extractJson, focusTopicFrom, isNearDuplicate, normalizeForDedupe, planBatchJobs, sanitizeSet };

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && (path === '/' || path.endsWith('/health'))) {
      const { base, key, token } = judge0Config();
      return json({
        ok: true,
        service: 'starquiz',
        judge: { base, hasKey: !!(key || token) },
        ai: { provider: 'qoder', configured: qoderConfigured() }
      });
    }

    if (req.method !== 'POST') {
      return fail('method_not_allowed', '仅支持 POST 请求', 405);
    }

    if (path.endsWith('/judge/run')) return await handleJudge(req);
    if (path.endsWith('/ai/start')) return await handleAIStart(req);
    if (path.endsWith('/ai/poll')) return await handleAIPoll(req);

    return fail('not_found', '接口不存在', 404);
  } catch {
    return fail('internal_error', '服务暂时不可用，请稍后重试', 500);
  }
}
