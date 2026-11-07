// ========================================
// StarQuiz 后端函数（Deno Edge Function）
// 能力：
//   POST /judge/run     编程题代码运行（Judge0 代理）
//   POST /ai/start      学习资料 -> 出题批次清单（纯函数规划，不保存任务状态）
//   POST /ai/generate   批次序号 -> 该批次题目（同步补全）
// 站点网关在 60 秒断开单个请求，而上游是同步返回的：所以一次请求只出一小批
// （不超过十余道题），批次由浏览器并发编排。
// API Key 只存在于函数环境，绝不进入浏览器、提示词或日志。
// 每个 POST 先过 requestGuard.ts 这道安检：同源校验、JSON Content-Type、按字节封顶的
// 流式 body、按来源 IP 的令牌桶（出题与判题各一桶）。/health 例外——它是运维探活
// 和发布后只读核对的入口。
// ========================================

import { completeJson, deepseekConfigured, LlmError } from './deepseek.ts';
import { asRejection, checkAccess, readJsonBody } from './requestGuard.ts';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...(headers || {}) } });
}

function fail(code: string, message: string, status = 400, headers?: Record<string, string>): Response {
  return json({ ok: false, error: { code, message } }, status, headers);
}

// 闸门的拒绝带 code 与状态码，原样透传：前端按 code 出文案，中文原文只是兜底。
function reject(error: unknown): Response {
  const rejection = asRejection(error);
  if (!rejection) return fail('internal_error', '服务暂时不可用，请稍后重试', 500);
  return fail(rejection.code, rejection.message, rejection.status, rejection.headers());
}

/**
 * POST body 的唯一读取口。返回 Response 表示已被闸门拦下（过大 / 不是 JSON / 类型不对）。
 * 三个路由不再各写一遍 try/catch，也不再各说各的「请求格式错误」。
 */
async function readBody(req: Request, maxBytes: number): Promise<Record<string, unknown> | Response> {
  try {
    return await readJsonBody(req, maxBytes);
  } catch (error) {
    if (asRejection(error)) return reject(error);
    return fail('invalid_request', '请求格式错误');
  }
}

// 出题只有一条通道：配了 Key 走同步批次，没配就明确告知未启用，不再退到别的服务
const AI_NOT_CONFIGURED = 'AI 服务尚未启用，请在站点设置中配置 API Key。';

/* ---------------- Judge0 ---------------- */

const JUDGE0_LANG_IDS: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  python: 71,     // Python 3.8.1
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62        // Java (OpenJDK 13)
};

// 判题只走站点自己配置的实例：地址与凭证都由站点显式提供，缺一个就不跑，
// 绝不把用户代码默认送到公共实例上。
const JUDGE_NOT_CONFIGURED = '代码判题尚未启用，编程题不计分。';

function judge0Config() {
  const base = (Deno.env.get('JUDGE0_URL') || '').replace(/\/+$/, '');
  const key = Deno.env.get('JUDGE0_KEY') || '';
  const token = Deno.env.get('JUDGE0_TOKEN') || '';
  return { base, key, token, configured: !!base && !!(key || token) };
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
  const { base, key, token, configured } = judge0Config();
  // 未配置就先拒，连请求体都不必读
  if (!configured) return fail('judge_not_configured', JUDGE_NOT_CONFIGURED, 503);

  const parsed = await readBody(req, 128 * 1024);
  if (parsed instanceof Response) return parsed;
  const body = parsed;

  const language = String(body.language || '');
  const source = String(body.source || '');
  const stdin = String(body.stdin || '');

  const langId = JUDGE0_LANG_IDS[language];
  if (!langId) return fail('invalid_request', '不支持的编程语言');
  if (!source.trim()) return fail('invalid_request', '代码不能为空');
  if (source.length > 100_000) return fail('invalid_request', '代码过长');
  if (stdin.length > 10_000) return fail('invalid_request', '输入过长');

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

// 单次上限按「函数请求体 512KB」和「一批提示词体积」倒推：
// 中文字 3 字节，96,000 字约 290KB，笔记与真题两边合计再留出头名与 JSON 开销。
// 上限不再是「一份教材读不完」，只是「一轮别再塞进几百 KB」，超了才要求拆两轮。
const NOTE_MAX_CHARS = 96_000;
const BATCH_EXAM_MAX_CHARS = 96_000;
const BATCH_TOTAL_MAX_CHARS = 128_000;

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


// 把总题量按篇幅比例分配到各段，每段至少 1 题
// （每段至少 2 题时，段数一多实际题量就会明显超出用户滑到的数字）
function distributeCount(total: number, parts: string[]): number[] {
  const weights = parts.map((part) => Math.max(1, part.replace(/\s/g, '').length));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const counts = weights.map((w) => Math.max(1, Math.floor((total * w) / sum)));
  let diff = total - counts.reduce((a, b) => a + b, 0);
  for (let guard = 0; diff !== 0 && guard < 400; guard++) {
    const index = guard % counts.length;
    if (diff > 0) {
      counts[index] += 1;
      diff -= 1;
    } else if (counts[index] > 1) {
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
    .slice(0, 32)
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

async function handleAIStart(req: Request): Promise<Response> {
  const parsed = await readBody(req, 512 * 1024);
  if (parsed instanceof Response) return parsed;
  const body = parsed;

  // 只有一条通道：没配 Key 就是「未启用」，不再退到别的服务上悄悄跑一遍
  if (!deepseekConfigured()) return fail('ai_not_configured', AI_NOT_CONFIGURED, 503);

  // 题型、语言、字数与批次上限都归 planSyncJobs 判定；这里只把它排好的批次告诉浏览器
  try {
    return syncStartResponse(planSyncJobs(body));
  } catch (error) {
    if (error instanceof SyncPlanError) return fail(error.code, error.message, error.status);
    return fail('invalid_request', '请求格式错误');
  }
}

/* ---------------- 同步批次出题 ---------------- */

// DeepSeek 是同步补全，一次调用只适合出少量题；站点网关又会在 60 秒掐断请求。
// 所以把一次生成拆成若干「批次」：每个批次一份小提示词，浏览器并发调用
// /ai/generate 拿回题目，再走原来的多段合并与去重。
// 批次划分是纯函数：同样的请求体 + 同样的 jobIndex 一定得到同样的提示词，
// 因此函数不需要保存任何任务状态，也不会有「刷新页面就找不到会话」的问题。
const SYNC_NOTE_QUESTIONS_PER_CALL = 6;
// 批次数同时受题量和资料体积驱动：单批提示词目标体积，资料再厚也不会把一批撑大
const SYNC_NOTE_CHUNK_TARGET_CHARS = 4_500;
const SYNC_NOTE_MAX_CHUNKS = 16;
const SYNC_EXAM_QUESTIONS_PER_CALL = 8;
const SYNC_EXAM_MAX_CHUNKS = 10;
// 真题块除了题数上限，还有一条字数上限：题干很长的整卷（简答、编程题）不能靠题数压体积
const SYNC_EXAM_CHUNK_MAX_CHARS = 6_000;
// 一轮最多多少批：并发 3，超出就是资料本身该拆两轮
const SYNC_MAX_JOBS = 24;
// 一批的返回体积上限：正常一批只有几道题，超出说明上游输出跑飞了，别拿去解析
const MAX_AI_OUTPUT_CHARS = 200_000;

interface SyncJob {
  index: number;
  group: 'note' | 'exam';
  label: string;
  count: number;
  expected: number;
  prompt: string;
  maxTokens: number;
}

interface SyncPlan {
  mode: 'generate' | 'exam' | 'batch';
  count: number;
  jobs: SyncJob[];
}

class SyncPlanError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'SyncPlanError';
    this.code = code;
    this.status = status;
  }
}

// 输出预算按题量估算：题目 JSON 是主要开销，留出知识点与题干余量
function syncMaxTokens(group: 'note' | 'exam', questions: number): number {
  const perQuestion = group === 'exam' ? 380 : 300;
  return Math.min(7_000, 900 + perQuestion * Math.max(1, questions));
}

// 批次边界分三级：段落之间 > 换行 > 句号。前一级切不出足够的刀数就降到下一级，
// 否则「一份没有空行的长文」会一刀都切不开，整份资料挤进一个请求——那就是一次超时。
function findBoundaries(material: string, level: number): number[] {
  const out: number[] = [];
  if (level === 0) {
    for (let i = 0; i < material.length - 1; i++) {
      if (material[i] === '\n' && material[i + 1] === '\n') out.push(i);
    }
  } else if (level === 1) {
    for (let i = 0; i < material.length; i++) if (material[i] === '\n') out.push(i);
  } else {
    for (let i = 0; i < material.length - 1; i++) {
      const ch = material[i];
      if (ch === '。' || ch === '！' || ch === '？' || ch === '；' || ch === ';') out.push(i + 1);
    }
  }
  return out;
}

function boundariesFor(material: string, want: number): number[] {
  let best = findBoundaries(material, 0);
  for (let level = 1; level <= 2 && best.length < want; level++) {
    const next = findBoundaries(material, level);
    if (next.length > best.length) best = next;
  }
  return best;
}

// 按段落边界把资料尽量等分，切不出来的边界就少切一刀：
// 不同批次覆盖不同段落，比同一份资料反复要求「换角度出题」更不容易出重复题。
function splitByBoundaries(material: string, desired: number, maxChunks: number): string[] {
  const count = Math.max(1, Math.min(Number(desired) || 1, maxChunks));
  if (count === 1 || material.length < 1_200) return [material];

  const boundaries = boundariesFor(material, count - 1);
  if (!boundaries.length) return [material];

  const minPart = Math.max(120, Math.floor(material.length / (count * 4)));
  const cuts: number[] = [];
  let cursor = 0;
  for (let i = 1; i < count; i++) {
    const target = Math.round((material.length * i) / count);
    const reserve = minPart * (count - i);
    let best = -1;
    for (const boundary of boundaries) {
      if (boundary < cursor + minPart || boundary > material.length - reserve) continue;
      if (best < 0 || Math.abs(boundary - target) < Math.abs(best - target)) best = boundary;
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
  return parts.filter((part) => part.trim().length >= 40);
}

// 笔记批数：题量要求切几刀、体积要求切几刀，取更多的那个。
// 批数不超过题量（每批至少 1 题），也不超过一轮上限。
function noteChunkCount(materialLength: number, total: number): number {
  const questions = Math.max(1, Math.round(Number(total) || 1));
  const byCount = Math.ceil(questions / SYNC_NOTE_QUESTIONS_PER_CALL);
  const byVolume = Math.ceil(materialLength / SYNC_NOTE_CHUNK_TARGET_CHARS);
  return Math.max(1, Math.min(SYNC_NOTE_MAX_CHUNKS, Math.max(byCount, Math.min(byVolume, questions))));
}

function splitNoteChunks(material: string, desired: number): string[] {
  return splitByBoundaries(material, desired, SYNC_NOTE_MAX_CHUNKS);
}

// 真题按题号切块：整理模式要求「一道都不能少」，所以只在题目边界下刀，
// 块首保留卷头标题，块间带上文尾巴用于跨块判读题号。
// 题数和块内字数任一触顶就下刀：整卷全是简答/编程题时，光靠题数压不住提示词体积。
function splitExamChunksByQuestions(material: string, perCall: number, maxChars = SYNC_EXAM_CHUNK_MAX_CHARS): string[] {
  const size = Math.max(1, Math.min(Number(perCall) || 1, 12));
  const starts = examQuestionStarts(material);
  if (!starts.length) return splitByBoundaries(material, Math.ceil(material.length / maxChars), SYNC_MAX_JOBS);
  if (starts.length <= size && material.length <= maxChars) return [material];

  const preamble = starts[0] > 0 ? material.slice(0, starts[0]) : '';
  const chunks: string[] = [];
  let blockStart = 0;
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1] : material.length;
    const span = end - starts[blockStart];
    const count = i - blockStart + 1;
    if (i === starts.length - 1 || count >= size || span >= maxChars) {
      chunks.push(material.slice(starts[blockStart], end));
      blockStart = i + 1;
    }
  }
  if (preamble && chunks.length) chunks[0] = preamble + chunks[0];
  return chunks.filter((chunk) => chunk.trim().length >= 40);
}

// 一轮批次数触顶：说明这份资料本身就该拆两轮，不能悄悄丢掉后面的批次
function assertJobBudget(jobs: SyncJob[]): SyncJob[] {
  if (jobs.length <= SYNC_MAX_JOBS) return jobs;
  throw new SyncPlanError(
    'invalid_request',
    `这一轮需要分成 ${jobs.length} 批，超过单轮 ${SYNC_MAX_JOBS} 批，请拆成两轮上传`,
    413
  );
}

function noteSyncJobs(material: string, total: number, types: string, codeLanguage: string | null, focus: string): SyncJob[] {
  const chunks = splitNoteChunks(material, noteChunkCount(material.length, total));
  const counts = chunks.length > 1 ? distributeCount(total, chunks) : [total];

  return chunks.map((chunk, index) => {
    const count = Math.max(1, Number(counts[index]) || 3);
    return {
      index: 0,
      group: 'note' as const,
      label: chunks.length > 1 ? `笔记第 ${index + 1} 批` : '笔记出题',
      count,
      expected: 0,
      prompt: buildPrompt(chunk, count, types, codeLanguage, focus),
      maxTokens: syncMaxTokens('note', count)
    };
  });
}

function examSyncJobs(material: string, collection: boolean, partOffsetLabel: (n: number) => string): SyncJob[] {
  const starts = examQuestionStarts(material);
  // 一次调用最多 10 块，题量大的整卷自动放宽每块题数（最多 12 题/块）
  const perCall = Math.min(12, Math.max(SYNC_EXAM_QUESTIONS_PER_CALL, Math.ceil(starts.length / SYNC_EXAM_MAX_CHUNKS)));
  const chunks = splitExamChunksByQuestions(material, perCall);
  const multi = chunks.length > 1;

  return chunks.map((chunk, index) => {
    const expected = examQuestionStarts(chunk).length;
    return {
      index: 0,
      group: 'exam' as const,
      label: partOffsetLabel(multi ? index + 1 : 0),
      count: expected,
      expected,
      prompt: buildExamPrompt(
        chunk,
        multi ? { index: index + 1, total: chunks.length, overlap: index > 0 ? chunks[index - 1].slice(-600) : '' } : undefined,
        collection
      ),
      maxTokens: syncMaxTokens('exam', expected)
    };
  });
}

// 超长只说差多少、下一步能做什么，和浏览器 gate 上那句是同一口径
// 这里说「字符」（含空白的原始长度）：上限管的就是这个数。界面上别处的「字」都不数空白，
// 两端算出同一个数字，用户看到的才不是两套字数。
function overLimitError(label: string, chars: number, cap: number, tail = ''): SyncPlanError {
  return new SyncPlanError(
    'invalid_request',
    `${label} ${chars.toLocaleString()} 字符，超过单次上限 ${cap.toLocaleString()} 字符，请拆成两轮上传${tail}`,
    413
  );
}

function planSyncJobs(body: Record<string, unknown>): SyncPlan {
  const modeRaw = String(body.mode || 'generate');
  const mode = modeRaw === 'exam' ? 'exam' : (modeRaw === 'batch' ? 'batch' : 'generate') as SyncPlan['mode'];
  const types = String(body.types || 'mixed');
  const codeLanguage = types === 'with-code' ? String(body.codeLanguage || 'python') : null;

  if (!(types in TYPE_RULES)) throw new SyncPlanError('invalid_request', '不支持的题型设置');
  if (codeLanguage && codeLanguage !== 'python' && codeLanguage !== 'javascript') {
    throw new SyncPlanError('invalid_request', '不支持的编程语言');
  }

  if (mode === 'batch') {
    const docs = parseBatchDocuments(body);
    const noteDocs = docs.filter((doc) => doc.kind === 'note');
    const examDocs = docs.filter((doc) => doc.kind === 'exam');
    if (!noteDocs.length || !examDocs.length) {
      throw new SyncPlanError('invalid_request', '混合整理需要同时包含笔记和真题');
    }
    const noteMaterial = joinBatchDocs(noteDocs, '笔记');
    const examMaterial = joinBatchDocs(examDocs, '试卷');
    if (noteMaterial.length > NOTE_MAX_CHARS) throw overLimitError('笔记资料', noteMaterial.length, NOTE_MAX_CHARS);
    if (examMaterial.length > BATCH_EXAM_MAX_CHARS) throw overLimitError('真题资料', examMaterial.length, BATCH_EXAM_MAX_CHARS);
    const combined = noteMaterial.length + examMaterial.length;
    if (combined > BATCH_TOTAL_MAX_CHARS) {
      throw overLimitError('笔记和真题合计', combined, BATCH_TOTAL_MAX_CHARS);
    }
    if (noteMaterial.replace(/\s/g, '').length < 50) throw new SyncPlanError('invalid_request', '笔记内容太短（至少 50 字）');
    if (examMaterial.replace(/\s/g, '').length < 50) throw new SyncPlanError('invalid_request', '真题内容太短（至少 50 字）');

    const range = countRangeFor(noteMaterial);
    const requested = Number(body.count);
    const totalCount = Number.isFinite(requested) && requested > 0
      ? Math.min(range.max, Math.max(range.min, Math.round(requested)))
      : range.recommended;

    const focus = focusTopicFrom(body);
    const noteJobs = noteSyncJobs(noteMaterial, totalCount, types, codeLanguage, focus);
    const examJobs = examSyncJobs(examMaterial, examDocs.length > 1, (n) => (n ? `真题第 ${n} 批` : '真题整理'));
    const jobs = assertJobBudget([...noteJobs, ...examJobs]).map((job, index) => ({ ...job, index }));
    return { mode: 'batch', count: totalCount, jobs };
  }

  const material = String(body.material || '').trim();
  if (mode === 'exam' && material.length > BATCH_EXAM_MAX_CHARS) {
    throw overLimitError('真题资料', material.length, BATCH_EXAM_MAX_CHARS, '，避免漏题');
  }
  if (mode === 'generate' && material.length > NOTE_MAX_CHARS) {
    throw overLimitError('资料', material.length, NOTE_MAX_CHARS);
  }

  const range = countRangeFor(material);
  if (range.chars < 50) throw new SyncPlanError('invalid_request', '资料内容太短（至少 50 字）');

  if (mode === 'exam') {
    const jobs = assertJobBudget(examSyncJobs(material, false, (n) => (n ? `真题第 ${n} 批` : '真题整理'))).map((job, index) => ({ ...job, index }));
    return { mode: 'exam', count: 0, jobs };
  }

  const requested = Number(body.count);
  const count = Number.isFinite(requested) && requested > 0
    ? Math.min(range.max, Math.max(range.min, Math.round(requested)))
    : range.recommended;
  // 联动聚焦出题只约束笔记生成：考点标题不可信，只进提示词
  const focus = focusTopicFrom(body);
  const jobs = assertJobBudget(noteSyncJobs(material, count, types, codeLanguage, focus)).map((job, index) => ({ ...job, index }));
  return { mode: 'generate', count, jobs };
}

function syncStartResponse(plan: SyncPlan): Response {
  return json({
    ok: true,
    mode: plan.mode,
    sessions: plan.jobs.map((job) => ({
      index: job.index,
      group: job.group,
      label: job.label,
      expected: job.expected
    })),
    parts: plan.jobs.length,
    count: plan.count
  });
}

// 一个批次 = 一次同步补全：浏览器并发调用，函数不保存任何任务状态
async function handleAIGenerate(req: Request): Promise<Response> {
  const parsed = await readBody(req, 512 * 1024);
  if (parsed instanceof Response) return parsed;
  const body = parsed;

  if (!deepseekConfigured()) return fail('ai_not_configured', AI_NOT_CONFIGURED, 503);

  const jobIndex = Math.round(Number(body.jobIndex));
  if (!Number.isFinite(jobIndex) || jobIndex < 0) return fail('invalid_request', '缺少要生成的批次序号');

  let plan: SyncPlan;
  try {
    plan = planSyncJobs(body);
  } catch (error) {
    if (error instanceof SyncPlanError) return fail(error.code, error.message, error.status);
    return fail('invalid_request', '请求格式错误');
  }

  const job = plan.jobs.find((item) => item.index === jobIndex);
  if (!job) return fail('invalid_request', '批次序号超出范围，请重新生成');

  try {
    const output = await completeJson(job.prompt, {
      maxTokens: job.maxTokens,
      stage: `sync-${job.group}-${jobIndex}`
    });
    if (output.length > MAX_AI_OUTPUT_CHARS) {
      return fail('ai_bad_output', 'AI 返回内容过大，请减少题量后重试', 502);
    }
    return json({
      ok: true,
      done: true,
      set: sanitizeSet(extractJson(output)),
      job: { index: job.index, group: job.group, label: job.label, expected: job.expected }
    });
  } catch (error) {
    if (error instanceof LlmError) return fail(error.code, error.message, error.status);
    return fail('ai_bad_output', 'AI 返回的题目格式不正确，请重试', 502);
  }
}

/* ---------------- 路由 ---------------- */

// 供本地测试直接调用的纯函数（生产路径不依赖这些导出）
export { buildExamPrompt, buildPrompt, examQuestionStarts, extractJson, focusTopicFrom, isNearDuplicate, normalizeForDedupe, planSyncJobs, sanitizeSet, splitExamChunksByQuestions, splitNoteChunks };

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && (path === '/' || path.endsWith('/health'))) {
      // 只报「能不能用」，不报地址与凭证细节
      return json({
        ok: true,
        service: 'starquiz',
        judge: { configured: judge0Config().configured },
        ai: { configured: deepseekConfigured() }
      });
    }

    if (req.method !== 'POST') {
      return fail('method_not_allowed', '仅支持 POST 请求', 405);
    }

    // 安检只在这里判一次：判题和出题各有各的额度，来源校验两者相同。
    // 放在路由分发之前，被拒的请求连 body 都不会被读进来。
    checkAccess(req, path.endsWith('/judge/run') ? 'judge' : 'ai');

    if (path.endsWith('/judge/run')) return await handleJudge(req);
    if (path.endsWith('/ai/generate')) return await handleAIGenerate(req);
    if (path.endsWith('/ai/start')) return await handleAIStart(req);

    return fail('not_found', '接口不存在', 404);
  } catch (error) {
    // 闸门的拒绝带 code 与状态码，原样透传；其余才是真的服务端意外。
    return reject(error);
  }
}
