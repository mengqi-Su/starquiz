const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function norm(s) {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDuration(sec) {
  if (sec == null) return '-';
  if (sec < 60) return `${sec}秒`;
  return `${Math.floor(sec / 60)}分${sec % 60 ? (sec % 60) + '秒' : ''}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sameSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  return [...a].sort().join(',') === [...b].sort().join(',');
}

const ICON = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5h5.5a3 3 0 0 1 3 3v11.5a3 3 0 0 0-3-2.5H4z"/><path d="M20 4.5h-3.5a3 3 0 0 0-3 3v11.5a3 3 0 0 1 3-2.5H20z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1.4 3.3-2.4 4.6-2.4 7.7a2.4 2.4 0 0 0 4.8 0c0-1.2-.5-2.2-1.2-3 2.6 1.4 4.3 3.6 4.3 6.4a5.5 5.5 0 0 1-11 0C6.5 10.2 9.1 7.1 12 3z"/></svg>`,
  flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v5.2L5.4 17a2.2 2.2 0 0 0 1.9 3.3h9.4a2.2 2.2 0 0 0 1.9-3.3L14 8.2V3"/><path d="M7.6 14.5h8.8"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4M4 20h16"/><path d="M8.5 16v-4.5M13 16V7.5M17.5 16v-6.5"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5h16V20l-8-4.5L4 20z"/><path d="M8 9h8"/></svg>`,
  pen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M13.5 6.5l4 4"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 20h15"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15"/></svg>`,
  bulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.4 10.9c.6.5 1 1.2 1 2h4.8c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.1 5.9 5.9 2.1-5.9 2.1L12 18.5l-2.1-5.9-5.9-2.1 5.9-2.1z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>`,
  card: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12h15M13.5 6l6 6-6 6"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4.5v2A3.5 3.5 0 0 0 8 10.5M16 5h3.5v2a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 13v4M8.5 21h7M10 17h4l.5 4h-5z"/></svg>`,
  // 导航图标只在这里定义一次，桌面侧栏和移动端底栏共用
  navHome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/></svg>`,
  navFolder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2h7.4a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>`,
  navChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V4M4 20h16"/><path d="M8.5 16v-4.5M13 16V7.5M17.5 16v-6.5"/></svg>`,
  navGear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h9M18 7h1M5 12h4M13 12h6M5 17h9M18 17h1"/><circle cx="16" cy="7" r="2"/><circle cx="11" cy="12" r="2"/><circle cx="16" cy="17" r="2"/></svg>`,
  navWrong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12.5a8 8 0 1 1-2.6-5.9"/><path d="M20 4.5V9h-4.5"/><path d="M9.5 11.5l5 5M14.5 11.5l-5 5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  // 练习科目收纳卡组与侧栏分组用的三个线性图标，规格同 Exam Plan（lucide 16px / 行内 14px）
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9.5 7V4.8h5V7M6.6 7l.8 12.1a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.4 7"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5 12 15.5l6-6"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>`
};

// bar 用于练习科目/练习集卡左侧的 3px 色条：需要在白卡上可读，所以用实色而不是淡底。
const SET_ACCENTS = [
  { bg: 'var(--lime-soft)', fg: 'var(--ink)', bar: '#1c1b1a' },
  { bg: 'var(--coral-soft)', fg: 'var(--coral)', bar: '#b42318' },
  { bg: 'var(--sun-soft)', fg: 'var(--sun)', bar: '#8a5a00' },
  { bg: 'var(--mint-soft)', fg: 'var(--green)', bar: '#3f6b4f' },
  { bg: 'var(--paper-2)', fg: 'var(--ink)', bar: '#a39e97' },
  { bg: 'var(--ink)', fg: 'var(--paper)', bar: '#1c1b1a' }
];

function setAccent(set) {
  if (set && Number.isInteger(set.accent)) return SET_ACCENTS[set.accent % SET_ACCENTS.length];
  const key = String((set && set.id) || 'set');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
  return SET_ACCENTS[h % SET_ACCENTS.length];
}

function difficultyDots(n) {
  const level = Math.min(3, Math.max(1, parseInt(n, 10) || 1));
  return `<span class="difficulty" aria-label="难度 ${level}">${[1, 2, 3].map((i) => `<i class="${i <= level ? 'on' : ''}"></i>`).join('')}</span>`;
}

function todayAnswered() {
  const key = todayStr();
  return history
    .filter((a) => todayStrOf(a.finishedAt) === key)
    .reduce((n, a) => n + (a.total || 0), 0);
}

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const STORAGE = {
  sets: 'sq_sets_v1',
  history: 'sq_history_v1',
  wrong: 'sq_wrong_v1',
  settings: 'sq_settings_v1',
  subjects: 'sq_subjects_v1',
  planLinks: 'sq_plan_links_v1'
};
const SESSION_KEYS = { exam: 'sq_exam_v1', learning: 'sq_learning_v1' };

// 起始不预置任何练习科目：练习科目由用户新建或在 AI 生成时自动创建；未归档的练习集进入「未分类」
const BUILTIN_SUBJECTS = [];
// 「未分类」是系统收纳位，不是用户取的名字：名字跟着界面语言走，这样英文界面里不会漏出中文。
// 用户自建练习科目的 name 仍然是数据，渲染处一律 data-no-i18n，不进词典。切语言会整页重渲染，getter 取值即最新。
const INBOX_SUBJECT = {
  id: 'sub-inbox',
  icon: '杂',
  builtin: true,
  inbox: true,
  get name() {
    return typeof isEn === 'function' && isEn() ? 'Unfiled' : '未分类';
  }
};
// 备考规划伴侣应用：考点级深链互相跳转，数据各自保存在本地浏览器
const EXAM_PLAN_URL = 'https://exam-plan-ai-zfc3er164xi.qoder.zone';
let planLink = null; // 当前页面的临时联动上下文；持久关系保存在 sq_plan_links_v1（planLinkStore）
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;
const bootNotes = [];
let lastStorageWarn = 0;

// 联动协议 v1 的常量与长度闸门（必须在启动读取 planLinks 之前就声明）
const PLAN_LINK_SCHEMA_VERSION = 1;
// 超长标题判为无效而不是截断：截断后两端算出的钥匙会对不上
const PLAN_PARAM_LIMITS = { plan: 64, subject: 100, unit: 400, topic: 400, exam: 150, task: 128 };
const PLAN_LINK_ID_RE = /^([\w.\-]{1,64}):(t1_[0-9a-f]{32})$/;
const PLAN_ID_RE = /^[\w.\-:]{1,64}$/;
const PLAN_TOPIC_KEY_RE = /^t1_[0-9a-f]{32}$/;
const PLAN_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PLAN_ISO_RE = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/;

// 考试级联动快照：Exam Plan 在点击「练这个考点」时，把这场考试的资料与真题原文，
// 留在同一个标签页的 window.name 里随跳转一起过来。读到即清空，不经过服务器，
// 也不跨域读取对方的 IndexedDB / localStorage——只在用户自己点这一次换一手数据。
const HANDOFF_PROTOCOL = 'exam-plan-handoff';
const HANDOFF_VERSION = 1;
const HANDOFF_LIMITS = {
  maxJson: 1_500_000,
  materials: 20,
  name: 160,
  text: 200_000,        // 与 sanitizeMaterialMeta 的文本上限一致，超过会被截到这里
  minVisibleChars: 50,  // 与上传解析的字数闸门一致：少于这个字数出不出题
};
// 本次跳转带来的快照；启动时取一次，用不上下次也不会再出现（window.name 已被清空）
let examHandoff = null;

function arrOf(x) { return Array.isArray(x) ? x : []; }
function objOf(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
function strOf(x, max = 4000) { return String(x ?? '').slice(0, max); }
function intOf(x, def, min, max) {
  const n = parseInt(x, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}
function idOf(value, prefix) {
  const s = String(value ?? '');
  return /^[A-Za-z0-9_-]{1,64}$/.test(s) ? s : prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 读取本地数据：解析失败时保留原始副本，避免用户数据被静默覆盖
function readStored(key) {
  let raw = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { ok: false, value: null };
  }
  if (raw == null) return { ok: true, value: null, missing: true };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    let kept = false;
    try {
      localStorage.setItem(`${key}_corrupt_${Date.now().toString(36)}`, raw.slice(0, 200000));
      kept = true;
    } catch { /* 副本也存不下时就保留原键 */ }
    bootNotes.push(kept
      ? '检测到本地数据损坏，已保留一份原始副本并重新初始化'
      : '检测到本地数据损坏，但副本未能写入，请尽快导出检查');
    if (kept) { try { localStorage.removeItem(key); } catch {} }
    return { ok: true, value: null, corrupt: true };
  }
}

function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    const now = Date.now();
    if (now - lastStorageWarn > 8000) {
      lastStorageWarn = now;
      toast('本地存储写入失败，可能是空间已满。请到「设置」导出备份后清理数据', 'error', 6000);
    }
    return false;
  }
}

function saveJSONQuiet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

function sanitizeQuality(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    parsed: Number(raw.parsed) || 0,
    kept: Number(raw.kept) || 0,
    duplicates: Number(raw.duplicates) || 0,
    removed: Number(raw.removed) || 0,
    repaired: Number(raw.repaired) || 0,
    issues: arrOf(raw.issues).slice(0, 30).map((issue) => ({
      index: Number(issue && issue.index) || 0,
      kind: strOf(issue && issue.kind, 40),
      message: strOf(issue && issue.message, 300),
      question: strOf(issue && issue.question, 60)
    }))
  };
}

function sanitizeStoredQuestion(raw, takenIds) {
  if (!raw || typeof raw !== 'object') return null;
  const type = ['single', 'multi', 'tf', 'fill', 'code'].includes(raw.type) ? raw.type : 'single';
  const content = strOf(raw.content, 6000).trim();
  if (!content) return null;
  const q = {
    id: '',
    type,
    difficulty: intOf(raw.difficulty, 2, 1, 3),
    content,
    explanation: strOf(raw.explanation, 6000)
  };
  // 归属状态要跟着题目落盘：被默认塞进第一个知识点的题不能算作目标考点
  if (raw.kpUnmatched === true) q.kpUnmatched = true;
  if (type === 'single' || type === 'multi') {
    const options = arrOf(raw.options).slice(0, 8).map((o) => strOf(o, 800).trim()).filter(Boolean);
    if (options.length < 2) return null;
    if (type === 'single') {
      const answer = parseInt(raw.answer, 10);
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
      q.options = options;
      q.answer = answer;
    } else {
      const picked = (Array.isArray(raw.answer) ? raw.answer : [raw.answer])
        .map((x) => parseInt(x, 10))
        .filter((x) => Number.isInteger(x) && x >= 0 && x < options.length);
      const uniq = [...new Set(picked)].sort((a, b) => a - b);
      if (!uniq.length) return null;
      q.options = options;
      q.answer = uniq;
    }
  } else if (type === 'tf') {
    q.answer = raw.answer === true || raw.answer === 'true' || raw.answer === '正确' || raw.answer === 1 || raw.answer === '1';
  } else if (type === 'fill') {
    const answers = (Array.isArray(raw.answer) ? raw.answer : [raw.answer])
      .map((s) => strOf(s, 300).trim()).filter(Boolean).slice(0, 8);
    if (!answers.length) return null;
    q.answer = answers;
  } else {
    q.language = ['javascript', 'python', 'cpp', 'java'].includes(raw.language) ? raw.language : 'javascript';
    q.template = strOf(raw.template, 12000);
    q.answer = strOf(raw.answer, 12000);
    q.testCases = arrOf(raw.testCases).slice(0, 8).map((t) => ({
      input: strOf(t && t.input, 2000),
      expectedOutput: strOf(t && t.expectedOutput, 2000)
    })).filter((t) => t.input || t.expectedOutput);
  }
  q.id = idOf(raw.id && !takenIds.has(String(raw.id)) ? raw.id : '', 'q');
  takenIds.add(q.id);
  return q;
}

// 练习集出题来源：清洗链与详情页标签共用同一份白名单
const SET_ORIGIN_KINDS = ['generate', 'exam', 'batch'];

function sanitizeStoredSet(raw, takenSetIds) {
  if (!raw || typeof raw !== 'object') return null;
  const name = strOf(raw.name, 80).trim();
  if (!name) return null;
  const kpTaken = new Set();
  const knowledgePoints = arrOf(raw.knowledgePoints).slice(0, 30).map((kp, i) => {
    let id = /^[A-Za-z0-9_-]{1,40}$/.test(String(kp && kp.id)) ? String(kp.id) : 'kp' + (i + 1);
    if (kpTaken.has(id)) id = 'kp' + (i + 1) + Math.random().toString(36).slice(2, 4);
    kpTaken.add(id);
    return {
      id,
      title: (strOf(kp && kp.title, 80).trim() || `知识点 ${i + 1}`).slice(0, 60),
      content: strOf(kp && kp.content, 3000)
    };
  });
  const qTaken = new Set();
  const questions = [];
  let dropped = 0;
  arrOf(raw.questions).slice(0, 500).forEach((rq) => {
    const q = sanitizeStoredQuestion(rq, qTaken);
    if (!q) { dropped++; return; }
    const matched = knowledgePoints.some((k) => k.id === (rq && rq.knowledgePointId));
    q.knowledgePointId = matched ? rq.knowledgePointId : (knowledgePoints[0] ? knowledgePoints[0].id : null);
    if (!matched) q.kpUnmatched = true;
    questions.push(q);
  });
  if (!questions.length) return null;
  const id = idOf(raw.id && !takenSetIds.has(String(raw.id)) ? raw.id : '', 'custom-');
  takenSetIds.add(id);
  const quality = sanitizeQuality(raw.quality);
  // 联动来源必须显式放行并校验，否则刷新和备份导入后来源就丢了
  const source = sanitizeSetSource(raw.source, knowledgePoints.map((kp) => kp.id));
  return {
    id,
    name: name.slice(0, 40),
    description: strOf(raw.description, 300).trim(),
    icon: strOf(raw.icon, 8) || '题',
    tags: arrOf(raw.tags).slice(0, 6).map((t) => strOf(t, 20).trim()).filter(Boolean),
    knowledgePoints,
    questions,
    ...(/^sub-[A-Za-z0-9_-]{1,32}$/.test(String(raw.subjectId)) ? { subjectId: raw.subjectId } : {}),
    ...(source ? { source } : {}),
    // 出题来源与聚焦考点要在刷新/备份导入后仍然可见，否则详情页的「练习来源」上下文会凭空消失
    ...(SET_ORIGIN_KINDS.includes(String(raw.origin)) ? { origin: String(raw.origin) } : {}),
    ...(() => {
      const focus = strOf(raw.focusTopic, PLAN_PARAM_LIMITS.topic).trim();
      return focus ? { focusTopic: focus } : {};
    })(),
    ...(Number.isInteger(raw.accent) ? { accent: ((raw.accent % 6) + 6) % 6 } : {}),
    ...(quality ? { quality } : {}),
    ...(dropped ? { droppedQuestions: dropped } : {})
  };
}

function sanitizeStoredSets(raw, existingIds = new Set()) {
  const taken = new Set(existingIds);
  const sets = [];
  let droppedSets = 0;
  let droppedQuestions = 0;
  arrOf(raw).forEach((r) => {
    const s = sanitizeStoredSet(r, taken);
    if (!s) { droppedSets++; return; }
    if (s.droppedQuestions) { droppedQuestions += s.droppedQuestions; delete s.droppedQuestions; }
    sets.push(s);
  });
  return { sets, droppedSets, droppedQuestions };
}

// 自建练习科目 = 练习科目：除了名称，还带考试信息（目标考试 / 考试日期 / 开始日期 / 备考目标）
// 和练习参数（默认题量 / 每日练习目标），首页与 AI 出题都读这些字段。
function isoDateOf(v) {
  const s = strOf(v, 10).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

/* ===== 页头身份：页图标 =====
 * 规则与 Exam Plan AI 的 lib/pageIcon.ts 一致：图标只在「这份科目被点名的地方」出现一次，
 * 取值统一走 subjectIcon()；没显式选过时按名称/考试关键词自动配，配不出落到 📚。
 * 绝不随机——同一科目在两个位置渲染成不同图标，身份就散了。 */
const PAGE_ICON_CHOICES = ['📐', '🧮', '📊', '⚗️', '🔬', '🧬', '🧲', '🌍', '💻', '🧠', '🩺', '📜', '⚖️', '🏛️', '💹', '🔤', '🎼', '🎨', '🏗️', '⚙️', '🗄️', '🎓', '🧭', '📚'];

const KEYWORD_ICONS = [
  [['数学', '高数', '线性代数', '概率', '统计', '微积分', 'math', 'calculus', 'algebra', 'statistic', 'geometry'], '📐'],
  [['经济', '金融', '会计', '财务', 'market', 'finance', 'economi', 'account'], '💹'],
  [['物理', '力学', '电磁', 'quantum', 'physics'], '🧲'],
  [['化学', 'chemical', 'chemistry', 'organic'], '⚗️'],
  [['生物', '生物化', 'genetic', 'biology', 'molecu'], '🧬'],
  [['医学', '护理', '解剖', '临床', 'medic', 'nursing', 'anatom'], '🩺'],
  [['心理', 'cognit', 'psycholog'], '🧠'],
  [['计算机', '软件', '程序', '算法', '数据', 'code', 'programming', 'computer', 'algorithm', 'database', 'network'], '💻'],
  [['语文', '中文', '文学', '汉语', '历史', '考古', 'literature', 'chinese', 'history'], '📜'],
  [['政治', '法律', '法学', '马克思', 'philosoph', 'politic', 'law', 'legal'], '⚖️'],
  [['英语', '日语', '韩语', '法语', '德语', '俄语', '外语', '雅思', '托福', 'english', 'japanese', 'french', 'german'], '🔤'],
  [['地理', '地质', '环境', 'environment', 'geograph', 'geolog'], '🌍'],
  [['建筑', '工程', '机械', '电气', '土木', 'architect', 'engineer', 'mechanic', 'civil'], '🏗️'],
  [['音乐', '美术', '设计', '艺术', 'music', 'art', 'design'], '🎨'],
  [['管理', '工商', '人力', '营销', 'management', 'business', 'marketing'], '🗄️'],
  [['教育', '师范', 'teach', 'educat'], '🎓'],
  [['导游', '旅游', '酒店', 'travel', 'tourism', 'hospitality'], '🧭'],
];

function autoPageIcon(name, examName) {
  const haystack = `${name || ''} ${examName || ''}`.toLowerCase();
  for (const [keys, emoji] of KEYWORD_ICONS) {
    if (keys.some((key) => haystack.includes(key.toLowerCase()))) return emoji;
  }
  return '📚';
}

function subjectIcon(subject) {
  const custom = strOf(subject && subject.icon, 8).trim();
  if (custom) return custom;
  return autoPageIcon(subject && subject.name, subject && subject.examName);
}

/* ===== 页头封面：内置纹理 + 用户上传 =====
 * 与 Exam Plan AI 的 lib/pageCover.ts 同一套：封面只是装饰，不承载信息与动作，
 * 只出现在「打开这份科目」那一页的页头。存法一眼分得开——内置是 "preset:<id>"，
 * 图片是 "data:image/..."，其余一律当没有封面。纹理走浅纸质调子，压深了就成了营销 hero。 */
const grain = (angle, alpha) =>
  `repeating-linear-gradient(${angle}deg, rgba(28,27,26,${alpha}) 0 1px, rgba(255,255,255,0) 1px 7px)`;
const sheen = (from, to) =>
  `radial-gradient(120% 95% at 12% 0%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 58%), linear-gradient(180deg, ${from} 0%, ${to} 100%)`;

const COVER_PRESETS = [
  { id: 'paper', zh: '纸纹', en: 'Paper', background: `${grain(135, 0.022)}, ${grain(45, 0.014)}, ${sheen('#f1eee6', '#e5e1d6')}` },
  { id: 'mist', zh: '雾蓝', en: 'Mist', background: `${grain(135, 0.018)}, ${sheen('#e9f0f8', '#dbe6f1')}` },
  { id: 'moss', zh: '苔绿', en: 'Moss', background: `${grain(135, 0.018)}, ${sheen('#e9f0e7', '#dae4d8')}` },
  { id: 'wheat', zh: '麦黄', en: 'Wheat', background: `${grain(135, 0.02)}, ${sheen('#faf0cf', '#f2e2b0')}` },
  { id: 'clay', zh: '陶土', en: 'Clay', background: `${grain(135, 0.018)}, ${sheen('#f6e8e0', '#eed9cf')}` },
  { id: 'slate', zh: '石墨', en: 'Slate', background: `${grain(135, 0.02)}, ${grain(45, 0.012)}, ${sheen('#ececeb', '#dcdcd9')}` },
];

const PRESET_PREFIX = 'preset:';
// 封面进 localStorage，尺寸必须封顶：长边 1600 足够铺满最宽的带，再大只是把本地存储撑爆。
const COVER_MAX_EDGE = 1600;
const COVER_MAX_INPUT_BYTES = 12 * 1024 * 1024;
const COVER_MAX_DATA_CHARS = 420000;

function findCoverPreset(value) {
  const s = String(value || '');
  if (!s.startsWith(PRESET_PREFIX)) return null;
  return COVER_PRESETS.find((p) => p.id === s.slice(PRESET_PREFIX.length)) || null;
}

function coverImageSrc(value) {
  const s = String(value || '');
  return s.startsWith('data:image/') && s.length <= COVER_MAX_DATA_CHARS && !s.includes('"') ? s : null;
}

/** 存储层唯一的封面校验：不是内置纹理也不是合规图片，就退回「没有封面」。 */
function coverOf(raw) {
  const s = strOf(raw, COVER_MAX_DATA_CHARS + 64).trim();
  if (findCoverPreset(s)) return s;
  return coverImageSrc(s) ? s : '';
}

function hasSubjectCover(subject) {
  return Boolean(findCoverPreset(subject && subject.cover) || coverImageSrc(subject && subject.cover));
}

function subjectCoverHTML(subject) {
  const preset = findCoverPreset(subject.cover);
  const src = coverImageSrc(subject.cover);
  if (!preset && !src) return '';
  const style = preset ? ` style="background:${preset.background}"` : '';
  return `<div class="ui-cover-band"${style}>${src ? `<img src="${esc(src)}" alt="" decoding="async">` : ''}</div>`;
}

/** 读成封面用的 data URL：限尺寸 → 等比缩到长边 1600 → webp（不支持就 jpeg）；
 * 透明底先铺应用纸色，免得转 jpeg 时变黑块。压到上限还装不下就报 size。 */
function readCoverImage(file) {
  if (!file || !String(file.type || '').startsWith('image/')) return Promise.reject(coverError('type'));
  if (file.size > COVER_MAX_INPUT_BYTES) return Promise.reject(coverError('size'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(coverError('decode'));
    reader.readAsDataURL(file);
  }).then((raw) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(coverError('decode'));
    image.src = raw;
  })).then((image) => {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw coverError('decode');
    const encode = (edge, quality) => {
      const scale = Math.min(1, edge / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw coverError('canvas');
      ctx.fillStyle = '#f8f7f4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      let out = '';
      try { out = canvas.toDataURL('image/webp', quality); } catch { out = ''; }
      if (!out.startsWith('data:image/webp')) {
        try { out = canvas.toDataURL('image/jpeg', quality); } catch { throw coverError('canvas'); }
      }
      if (!out.startsWith('data:image/')) throw coverError('canvas');
      return out;
    };
    let encoded = encode(COVER_MAX_EDGE, 0.82);
    if (encoded.length > COVER_MAX_DATA_CHARS) encoded = encode(1000, 0.72);
    if (encoded.length > COVER_MAX_DATA_CHARS) throw coverError('size');
    return encoded;
  });
}

function coverError(code) {
  const error = new Error(`cover:${code}`);
  error.code = code;
  return error;
}

function coverErrorMessage(code) {
  if (code === 'size') return '图片太大，本地存不下，换一张或选内置纹理。';
  if (code === 'type') return '只能选图片文件。';
  return '这张图片读不出来，换一张或选内置纹理。';
}

function sanitizeSubjects(raw) {
  const builtinNames = new Set(BUILTIN_SUBJECTS.map((s) => s.name));
  const seen = new Set(BUILTIN_SUBJECTS.map((s) => s.id));
  const out = [];
  arrOf(raw).forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const name = strOf(item.name, 40).trim();
    if (!name || builtinNames.has(name)) return;
    const key = name.toLowerCase();
    if (out.some((s) => s.name.toLowerCase() === key)) return;
    let id = /^sub-[A-Za-z0-9_-]{1,32}$/.test(String(item.id)) ? String(item.id) : '';
    if (!id || seen.has(id)) id = 'sub-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    seen.add(id);
    // 早期版本把名称首字当图标存了下来；那不是用户选的图标，遇到就清空，让自动配图接管。
    const rawIcon = strOf(item.icon, 8).trim();
    out.push({
      id,
      name: name.slice(0, 40),
      icon: rawIcon && rawIcon !== name.slice(0, 1) ? rawIcon : '',
      cover: coverOf(item.cover),
      examName: strOf(item.examName, 100).trim(),
      examDate: isoDateOf(item.examDate),
      startDate: isoDateOf(item.startDate),
      goal: strOf(item.goal, 60).trim(),
      defaultCount: intOf(item.defaultCount, 15, 5, 60),
      dailyGoal: intOf(item.dailyGoal, 20, 5, 100),
      createdAt: Number(item.createdAt) || Date.now()
    });
  });
  return out;
}

// 资料记录只保留可重建的字段，原始文件另存在 IndexedDB 的 files 表
function sanitizeMaterialMeta(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = strOf(raw.name, 160).trim();
  const text = strOf(raw.text, 200000).trim();
  if (!name || !text) return null;
  return {
    id: idOf(raw.id, 'mat-'),
    subjectId: strOf(raw.subjectId, 40) || 'sub-inbox',
    name,
    size: Math.max(0, Number(raw.size) || 0),
    ext: strOf(raw.ext, 12).toLowerCase(),
    kind: raw.kind === 'exam' ? 'exam' : 'note',
    pages: Math.max(0, Number(raw.pages) || 0),
    chars: Math.max(0, Number(raw.chars) || aiVisibleChars(text)),
    addedAt: Number(raw.addedAt) || Date.now(),
    hasBlob: raw.hasBlob === true,
    text
  };
}

function repairHistory(raw) {
  const out = [];
  const seen = new Set();
  arrOf(raw).forEach((a, i) => {
    if (!a || typeof a !== 'object') return;
    const setId = strOf(a.setId, 80).trim();
    const finishedAt = Number(a.finishedAt);
    if (!setId || !Number.isFinite(finishedAt) || finishedAt <= 0) return;
    const answers = arrOf(a.answers).filter((x) => x && typeof x === 'object' && x.qid).map((x) => ({
      qid: strOf(x.qid, 64),
      type: strOf(x.type, 20),
      userAnswer: x.userAnswer,
      correct: x.correct === true ? true : x.correct === false ? false : null
    }));
    if (!answers.length) return;
    let id = idOf(a.id, 'a');
    if (seen.has(id)) id = 'a' + finishedAt.toString(36) + i;
    seen.add(id);
    const gradedDefault = answers.filter((x) => x.correct !== null).length;
    const graded = intOf(a.graded, gradedDefault, 0, 1000);
    const correct = intOf(a.correct, answers.filter((x) => x.correct === true).length, 0, graded || 1000);
    // 考点成绩快照要能挺过刷新和备份导入；旧历史没有它就只当普通成绩，不补算
    const planResult = sanitizePlanResult(a.planResult);
    out.push({
      id,
      setId,
      setName: strOf(a.setName, 80) || '（未知练习集）',
      mode: a.mode === 'exam' ? 'exam' : 'learning',
      startedAt: Number(a.startedAt) || finishedAt,
      finishedAt,
      durationSec: intOf(a.durationSec, 0, 0, 86400),
      total: intOf(a.total, answers.length, 1, 1000),
      graded,
      correct,
      ungraded: intOf(a.ungraded, 0, 0, 1000),
      score: intOf(a.score, graded ? Math.round((correct / graded) * 100) : 0, 0, 100),
      answers,
      ...(planResult ? { planResult } : {})
    });
  });
  return out.sort((x, y) => y.finishedAt - x.finishedAt).slice(0, 200);
}

/* 错题本 v2。主键仍是 setId + qid：题目 id 在集内生成（'q' + n），跨集会撞名。
   v1 每条只有次数、答对就删除；v2 每条存 {次数, 考点, 首错/最近错/最近对时间, 状态}，
   答对改成归档为 mastered——次数和错题时间都留着，用户随时能把这道题重新列入。 */
const WRONG_BANK_VERSION = 2;
const WRONG_DAY_MS = 86400000;
// 错 1 次隔天回看，错 2 次 3 天后回看；错到第 3 次算顽固题，之后每天都能练
const WRONG_SPACING = [1, 3];
const WRONG_STUBBORN_TIMES = 3;
const WRONG_MAX_STAMP = 4102444800000; // 2100-01-01：挡住被改坏的时间戳

function wrongBankSetCount(raw) {
  const src = objOf(raw);
  if (Object.prototype.hasOwnProperty.call(src, 'bySet')) return Object.keys(objOf(src.bySet)).length;
  return Object.keys(src).filter((k) => k !== 'version').length;
}

function emptyWrongBank() {
  return { version: WRONG_BANK_VERSION, bySet: {} };
}

function wrongTimesOf(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 999) : 0;
}

function wrongStampOf(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n < WRONG_MAX_STAMP ? Math.round(n) : null;
}

function normalizeWrongEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const times = wrongTimesOf(raw.times);
  if (!times) return null;
  const lastCorrectAt = wrongStampOf(raw.lastCorrectAt);
  const firstWrongAt = wrongStampOf(raw.firstWrongAt);
  const lastWrongAt = wrongStampOf(raw.lastWrongAt) || firstWrongAt;
  // 没有答对时间的条目不承认已掌握，状态一律退回 open
  return {
    times,
    status: raw.status === 'mastered' && lastCorrectAt ? 'mastered' : 'open',
    kpId: strOf(raw.kpId, 40).trim(),
    firstWrongAt: firstWrongAt || lastWrongAt,
    lastWrongAt,
    lastCorrectAt,
    lastAttemptId: strOf(raw.lastAttemptId, 64).trim()
  };
}

// v1 只有次数：复习时间回推到已有的练习记录上，查不到就留 null，不伪造「什么时候错的」
function wrongStampsFromHistory(attempts, setId, qid) {
  const out = { firstWrongAt: null, lastWrongAt: null, lastCorrectAt: null, wrongCount: 0 };
  arrOf(attempts).forEach((a) => {
    if (!a || a.setId !== setId) return;
    const at = wrongStampOf(a.finishedAt);
    if (!at) return;
    const hit = arrOf(a.answers).find((x) => x && x.qid === qid);
    if (!hit || (hit.correct !== true && hit.correct !== false)) return;
    if (hit.correct === false) {
      out.wrongCount++;
      out.lastWrongAt = Math.max(out.lastWrongAt || 0, at);
      out.firstWrongAt = out.firstWrongAt ? Math.min(out.firstWrongAt, at) : at;
    } else {
      out.lastCorrectAt = Math.max(out.lastCorrectAt || 0, at);
    }
  });
  return out;
}

function wrongKpIdOf(setId, qid) {
  const q = getQuestion(getSet(setId), qid);
  return q ? strOf(q.knowledgePointId, 40).trim() : '';
}

// 两种形状都要能读：{setId:{qid:次数}} 和 {version,bySet:{setId:{qid:{…}}}}；
// 补时间戳只填空值，所以重复执行（刷新、备份导入）不会改写已经算好的复习节奏
function repairWrong(raw, attempts) {
  const src = objOf(raw);
  const isEnvelope = Object.prototype.hasOwnProperty.call(src, 'bySet') || src.version === WRONG_BANK_VERSION;
  const map = isEnvelope ? objOf(src.bySet) : src;
  const bank = emptyWrongBank();
  Object.keys(map).slice(0, 200).forEach((rawSetId) => {
    const setId = strOf(rawSetId, 64);
    const entries = objOf(map[rawSetId]);
    const clean = {};
    Object.keys(entries).slice(0, 500).forEach((rawQid) => {
      const qid = strOf(rawQid, 64);
      if (!setId || !qid) return;
      const value = entries[rawQid];
      const legacyTimes = value && typeof value === 'object' ? 0 : wrongTimesOf(value);
      const entry = value && typeof value === 'object'
        ? normalizeWrongEntry(value)
        : (legacyTimes
          ? { times: legacyTimes, status: 'open', kpId: '', firstWrongAt: null, lastWrongAt: null, lastCorrectAt: null, lastAttemptId: '' }
          : null);
      if (!entry) return;
      if (entry.firstWrongAt === null || entry.lastWrongAt === null || entry.lastCorrectAt === null || !entry.kpId) {
        const derived = wrongStampsFromHistory(attempts, setId, qid);
        if (entry.firstWrongAt === null) entry.firstWrongAt = derived.firstWrongAt;
        if (entry.lastWrongAt === null) entry.lastWrongAt = derived.lastWrongAt || entry.firstWrongAt;
        if (entry.lastCorrectAt === null) entry.lastCorrectAt = derived.lastCorrectAt;
        if (derived.wrongCount > entry.times) entry.times = Math.min(999, derived.wrongCount);
        if (!entry.kpId) entry.kpId = wrongKpIdOf(setId, qid);
      }
      clean[qid] = entry;
    });
    if (Object.keys(clean).length) bank.bySet[setId] = clean;
  });
  return bank;
}

// 备份合并：次数取大的、时间取端的；只有一侧判为未掌握就当未掌握，不把对方的进步抹掉
function mergeWrongEntry(target, patch) {
  const next = target && target.times ? { ...target } : { ...patch };
  next.times = Math.min(999, Math.max(next.times || 0, patch.times || 0));
  next.status = next.status === 'open' || patch.status === 'open' ? 'open' : 'mastered';
  const stamps = [next.firstWrongAt, patch.firstWrongAt].filter(Boolean);
  next.firstWrongAt = stamps.length ? Math.min(...stamps) : null;
  const wrongs = [next.lastWrongAt, patch.lastWrongAt].filter(Boolean);
  next.lastWrongAt = wrongs.length ? Math.max(...wrongs) : null;
  const rights = [next.lastCorrectAt, patch.lastCorrectAt].filter(Boolean);
  next.lastCorrectAt = rights.length ? Math.max(...rights) : null;
  if (next.status === 'mastered' && !next.lastCorrectAt) next.status = 'open';
  next.kpId = next.kpId || patch.kpId || '';
  next.lastAttemptId = '';
  return next;
}

const bootSets = readStored(STORAGE.sets);
const bootHistory = readStored(STORAGE.history);
const bootWrong = readStored(STORAGE.wrong);
const bootSubjects = readStored(STORAGE.subjects);
const bootPlanLinks = readStored(STORAGE.planLinks);
const settings = objOf(readStored(STORAGE.settings).value);

const baseSetIds = new Set(
  (typeof SAMPLE_SETS !== 'undefined' ? arrOf(SAMPLE_SETS) : []).map((s) => s.id)
);
if (!bootSets.ok) bootNotes.push('浏览器当前禁止了本地存储，本次的练习集和记录在刷新后可能丢失');
const repairedSets = sanitizeStoredSets(bootSets.value, baseSetIds);
let customSets = repairedSets.sets;
let history = repairHistory(bootHistory.value);
let wrongBank = repairWrong(bootWrong.value, history);
let userSubjects = sanitizeSubjects(bootSubjects.value);
let planLinkStore = sanitizePlanLinks(bootPlanLinks.value);
let materials = [];

// 早期版本会把内置的演示练习集和练习科目写进本地存储。起始状态现在保持干净，
// 这里一次性清掉那些遗留的演示内容；用户自己上传资料生成的练习集不受影响。
const LEGACY_DEMO_SET_IDS = ['modern-history', 'biology-basics', 'js-basics', 'python-basics'];
const LEGACY_DEMO_SUBJECT_IDS = ['sub-history', 'sub-bio', 'sub-code'];
const legacyDemoSetIds = new Set(LEGACY_DEMO_SET_IDS);
const legacyDemoRemovedSets = customSets.filter((s) => legacyDemoSetIds.has(s.id));
if (legacyDemoRemovedSets.length) {
  customSets = customSets.filter((s) => !legacyDemoSetIds.has(s.id));
  const keptSetIds = new Set(customSets.map((s) => s.id));
  history = history.filter((h) => keptSetIds.has(h.setId));
  LEGACY_DEMO_SET_IDS.forEach((id) => { delete wrongBank.bySet[id]; });
}
// 内置练习科目可能已经被用户自己的练习集使用：只要还有练习集挂在上面，就把它当普通练习科目保留。
const legacyDemoSubjectIds = new Set(LEGACY_DEMO_SUBJECT_IDS);
const referencedSubjectIds = new Set(
  customSets.map((s) => s.subjectId).filter((id) => typeof id === 'string' && id)
);
if (userSubjects.some((s) => legacyDemoSubjectIds.has(s.id) && !referencedSubjectIds.has(s.id))) {
  userSubjects = userSubjects.filter(
    (s) => !legacyDemoSubjectIds.has(s.id) || referencedSubjectIds.has(s.id)
  );
}
const removedDemoContent = legacyDemoRemovedSets.length > 0;
let materialsReady = false;
let materialsUnavailable = false;

if (repairedSets.droppedSets) bootNotes.push(`已跳过 ${repairedSets.droppedSets} 个损坏的练习集`);
if (repairedSets.droppedQuestions) bootNotes.push(`已修复 ${repairedSets.droppedQuestions} 道异常题目`);
if (removedDemoContent) bootNotes.push('已移除早期内置的演示练习集，题目现在只来自你上传的资料');
if (!bootSets.missing && bootSets.ok && !bootSets.corrupt) {
  const rawCount = arrOf(bootSets.value).length;
  if (customSets.length !== rawCount || repairedSets.droppedQuestions) {
    saveJSONQuiet(STORAGE.sets, customSets);
  }
}
if (!bootHistory.missing && bootHistory.ok && !bootHistory.corrupt) {
  if (history.length !== arrOf(bootHistory.value).length) saveJSONQuiet(STORAGE.history, history);
}
if (!bootWrong.missing && bootWrong.ok && !bootWrong.corrupt) saveJSONQuiet(STORAGE.wrong, wrongBank);
if (!bootSubjects.missing && bootSubjects.ok && !bootSubjects.corrupt) {
  if (userSubjects.length !== arrOf(bootSubjects.value).length) saveJSONQuiet(STORAGE.subjects, userSubjects);
}
if (bootSubjects.corrupt) bootNotes.push('练习科目数据损坏，已保留备份并重置为空列表');

let resume = { exam: null, learning: null };
let learningPersistTimer = null;
let examPersistTimer = null;
let lastSessionWarn = 0;

function warnSessionSaveFailed() {
  if (Date.now() - lastSessionWarn < 15000) return;
  lastSessionWarn = Date.now();
  toast('进度自动保存失败，刷新页面可能丢失本次作答，建议先导出备份', 'error', 5000);
}

function persistExam() {
  const ex = state.exam;
  if (!ex) return false;
  const ok = saveJSONQuiet(SESSION_KEYS.exam, {
    v: 1,
    setId: ex.setId,
    name: ex.name || '',
    questions: ex.questions,
    owners: ex.owners || null,
    mock: !!ex.mock,
    answers: ex.answers,
    current: ex.current,
    startedAt: ex.startedAt,
    deadline: ex.deadline,
    minutes: ex.minutes
  });
  if (!ok) warnSessionSaveFailed();
  return ok;
}

// 填空题/代码题逐字触发，合并写入
function persistExamSoon() {
  clearTimeout(examPersistTimer);
  examPersistTimer = setTimeout(persistExam, 350);
}

function persistLearning() {
  const l = state.learning;
  if (!l || l.finished) return false;
  const ok = saveJSONQuiet(SESSION_KEYS.learning, {
    v: 1,
    setId: l.setId,
    qids: l.qids,
    index: l.index,
    answers: l.answers,
    results: l.results,
    cache: l.cache,
    seenKP: l.seenKP || {},
    startedAt: l.startedAt,
    title: strOf(l.title, 60),
    onlyWrong: !!l.onlyWrong
  });
  if (!ok) warnSessionSaveFailed();
  return ok;
}

// 输入框逐字保存会太频繁，稍微延后一点
function persistLearningSoon() {
  clearTimeout(learningPersistTimer);
  learningPersistTimer = setTimeout(persistLearning, 400);
}

function clearSession(kind) {
  try { localStorage.removeItem(SESSION_KEYS[kind]); } catch {}
  if (resume && resume[kind]) resume[kind] = null;
  if (kind === 'learning') {
    clearTimeout(learningPersistTimer);
    learningPersistTimer = null;
  }
  if (kind === 'exam') {
    clearTimeout(examPersistTimer);
    examPersistTimer = null;
  }
}

function discardSession(kind, silent) {
  clearSession(kind);
  if (!silent) toast(kind === 'exam' ? '已放弃未完成的考试' : '已放弃未完成的学习', 'info');
  render();
}

function validateExamSession(p) {
  if (!p || typeof p !== 'object') return null;
  const questions = arrOf(p.questions);
  const answers = arrOf(p.answers);
  if (!questions.length || questions.length > 500 || answers.length !== questions.length) return null;
  const deadline = Number(p.deadline);
  if (!Number.isFinite(deadline) || deadline <= Date.now()) return null;
  const lite = questions.map((q) => ({
    id: strOf(q && q.id, 64),
    type: ['single', 'multi', 'tf', 'fill', 'code'].includes(q && q.type) ? q.type : 'single',
    difficulty: intOf(q && q.difficulty, 2, 1, 3),
    content: strOf(q && q.content, 6000),
    options: arrOf(q && q.options).slice(0, 8).map((o) => strOf(o, 800)),
    answer: q && q.answer,
    explanation: strOf(q && q.explanation, 6000),
    language: q && q.language,
    template: strOf(q && q.template, 12000),
    testCases: arrOf(q && q.testCases).slice(0, 8).map((t) => ({
      input: strOf(t && t.input, 2000),
      expectedOutput: strOf(t && t.expectedOutput, 2000)
    }))
  }));
  for (const q of lite) {
    if (!q.content) return null;
    if ((q.type === 'single' || q.type === 'multi') && q.options.length < 2) return null;
  }
  const cleanAnswers = answers.slice(0, lite.length).map((a, i) => {
    const q = lite[i];
    if (q.type === 'multi') {
      return arrOf(a).map((x) => parseInt(x, 10)).filter((n) => Number.isInteger(n) && n >= 0 && n < q.options.length);
    }
    if (q.type === 'tf') return typeof a === 'boolean' ? a : null;
    if (q.type === 'single') {
      const n = parseInt(a, 10);
      return Number.isInteger(n) && n >= 0 && n < q.options.length ? n : null;
    }
    return a == null ? null : strOf(a, 12000);
  });
  return {
    setId: strOf(p.setId, 80),
    name: strOf(p.name, 80) || '未命名考试',
    questions: lite,
    // owners 与题目一一对应；数量对不上就退回整场考试只用 setId
    owners: arrOf(p.owners).length === lite.length ? arrOf(p.owners).map((o) => strOf(o, 80)) : null,
    mock: !!p.mock,
    answers: cleanAnswers,
    current: intOf(p.current, 0, 0, lite.length - 1),
    startedAt: Number(p.startedAt) || Date.now(),
    deadline,
    minutes: intOf(p.minutes, 30, 1, 600)
  };
}

function validateLearningSession(p) {
  if (!p || typeof p !== 'object') return null;
  const baseSetId = strOf(p.setId, 80);
  // 键自带所属练习集：某一集被删掉时只丢掉它那些题，剩下的还能继续练
  const keys = arrOf(p.qids).map((k) => strOf(k, 200)).filter((k, i, all) => {
    if (!k || all.indexOf(k) !== i) return false;
    return !!sessionQuestionAt(baseSetId, k);
  });
  if (!keys.length) return null;
  const rawAnswers = objOf(p.answers);
  const rawResults = objOf(p.results);
  const rawCache = objOf(p.cache);
  const answers = {};
  keys.forEach((key) => {
    const q = sessionQuestionAt(baseSetId, key);
    if (!q || rawAnswers[key] === undefined) return;
    const v = rawAnswers[key];
    if (q.type === 'multi') answers[key] = arrOf(v).map((x) => parseInt(x, 10)).filter((n) => Number.isInteger(n) && n >= 0 && n < (q.options || []).length);
    else if (q.type === 'tf') answers[key] = typeof v === 'boolean' ? v : null;
    else if (q.type === 'single') answers[key] = Number.isInteger(parseInt(v, 10)) && v !== null ? parseInt(v, 10) : null;
    else answers[key] = v == null ? null : strOf(v, 12000);
  });
  const results = {};
  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(rawResults, key)) return;
    const r = objOf(rawResults[key]);
    results[key] = { correct: r.correct === true, answer: r.answer, output: strOf(r.output, 4000), revealed: !!r.revealed };
  });
  const cache = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rawCache, key)) cache[key] = strOf(rawCache[key], 12000);
  });
  return {
    setId: baseSetId,
    title: strOf(p.title, 60),
    qids: keys,
    index: intOf(p.index, 0, 0, keys.length - 1),
    answers,
    results,
    cache,
    seenKP: objOf(p.seenKP),
    startedAt: Number(p.startedAt) || Date.now(),
    finished: false,
    onlyWrong: !!p.onlyWrong
  };
}

function loadResumeSessions() {
  resume = { exam: null, learning: null };
  const exam = readStored(SESSION_KEYS.exam);
  if (exam.ok && exam.value) {
    const valid = validateExamSession(exam.value);
    if (valid) resume.exam = valid;
    else try { localStorage.removeItem(SESSION_KEYS.exam); } catch {}
  }
  const learn = readStored(SESSION_KEYS.learning);
  if (learn.ok && learn.value) {
    const valid = validateLearningSession(learn.value);
    if (valid) resume.learning = valid;
    else try { localStorage.removeItem(SESSION_KEYS.learning); } catch {}
  }
}

function renderResumeBar() {
  const rows = [];
  if (resume.exam) {
    const ex = resume.exam;
    const answered = ex.questions.filter((q, i) => isAnswered(q, ex.answers[i])).length;
    const left = Math.max(0, Math.floor((ex.deadline - Date.now()) / 1000));
    rows.push(`
      <div class="resume-bar">
        <span class="resume-tag">考试</span>
        <span class="resume-copy"><b>${esc(ex.name)}</b> · 已答 ${answered}/${ex.questions.length} · 剩余 ${fmtTime(left)}</span>
        <span class="resume-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="resumeExam()">继续考试</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="discardSession('exam')">放弃</button>
        </span>
      </div>`);
  }
  if (resume.learning) {
    const l = resume.learning;
    const total = l.qids.length;
    const answered = l.qids.filter((qid) => l.results[qid]).length;
    rows.push(`
      <div class="resume-bar">
        <span class="resume-tag">学习</span>
        <span class="resume-copy"><b>${esc(l.title || (getSet(l.setId) || {}).name || '学习进度')}</b> · 第 ${l.index + 1}/${total} 题 · 已答 ${answered}</span>
        <span class="resume-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="resumeLearning()">继续学习</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="discardSession('learning')">放弃</button>
        </span>
      </div>`);
  }
  return rows.join('');
}

function resumeExam() {
  const p = resume.exam;
  if (!p) return;
  if (p.deadline <= Date.now()) {
    discardSession('exam', true);
    toast('这场考试已经超时，不能再继续了', 'info');
    return;
  }
  state.exam = { ...p, grading: false, timerId: null };
  resume.exam = null;
  state.view = 'exam';
  state.setId = p.setId;
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function resumeLearning() {
  const p = resume.learning;
  if (!p) return;
  if (!p.qids.some((key, i) => !!learningQuestionAt(p, i))) {
    discardSession('learning', true);
    toast('练习集已被删除，无法继续学习', 'info');
    return;
  }
  state.learning = { ...p };
  resume.learning = null;
  state.view = 'learning';
  state.setId = p.setId;
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

const state = {
  view: 'dashboard',
  setId: null,
  subjectId: null,
  learning: null,
  exam: null,
  examResult: null,
  genPreview: null,
  timer: null,
  qnavOpen: false
};

const LANG_LABEL = { javascript: 'JavaScript', python: 'Python 3', cpp: 'C++', java: 'Java' };
const TYPE_LABEL = { single: '单选', multi: '多选', tf: '判断', fill: '填空', code: '编程' };
const TYPE_CLASS = { single: 'type-single', multi: 'type-multi', tf: 'type-tf', fill: 'type-fill', code: 'type-code' };
// 练习来源：让练习集详情页一眼看出这套题是怎么来的
const SET_ORIGIN_LABEL = {
  generate: 'AI 根据资料出题',
  exam: '真题原样整理',
  batch: '笔记出题 + 真题整理'
};

function allSets() {
  const samples = typeof SAMPLE_SETS !== 'undefined' ? arrOf(SAMPLE_SETS) : [];
  return [
    ...samples.map((s) => ({ ...s, builtin: true })),
    ...customSets.map((s) => ({ ...s, builtin: false }))
  ];
}

function getSet(id) {
  return allSets().find((s) => s.id === id) || null;
}

function getQuestion(set, qid) {
  return set && set.questions.find((q) => q.id === qid) || null;
}

function allSubjects() {
  return [...BUILTIN_SUBJECTS, ...userSubjects];
}

function subjectById(id) {
  if (id === INBOX_SUBJECT.id) return INBOX_SUBJECT;
  return allSubjects().find((s) => s.id === id) || null;
}

function subjectOfSet(set) {
  return subjectById(set && set.subjectId) || INBOX_SUBJECT;
}

function subjectSets(subjectId) {
  return allSets().filter((s) => subjectOfSet(s).id === subjectId);
}

function subjectMaterials(subjectId) {
  return materials.filter((m) => m.subjectId === subjectId);
}

function hasInboxContent() {
  return allSets().some((s) => subjectOfSet(s).id === INBOX_SUBJECT.id)
    || materials.some((m) => m.subjectId === INBOX_SUBJECT.id);
}

// 练习科目列表：内置练习科目 + 自建练习科目，有未归档内容时补一个「未分类」
function visibleSubjects() {
  return hasInboxContent() ? [...allSubjects(), INBOX_SUBJECT] : [...allSubjects()];
}

function subjectNameTaken(name, exceptId) {
  const key = norm(name);
  return visibleSubjects().some((s) => s.id !== exceptId && norm(s.name) === key);
}

function createSubject(name, extra) {
  const e = extra && typeof extra === 'object' ? extra : {};
  const clean = String(name || '').trim().slice(0, 40);
  if (!clean) {
    toast('练习科目名称不能为空', 'info');
    return null;
  }
  if (subjectNameTaken(clean)) {
    toast('已经有同名练习科目了', 'info');
    return null;
  }
  const subject = {
    id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: clean,
    // 图标留空 = 让自动配图接管；封面同理，没有就是「没有封面」的页头。
    icon: strOf(e.icon, 8).trim(),
    cover: coverOf(e.cover),
    examName: strOf(e.examName, 100).trim(),
    examDate: isoDateOf(e.examDate),
    startDate: isoDateOf(e.startDate),
    goal: strOf(e.goal, 60).trim(),
    defaultCount: intOf(e.defaultCount, 15, 5, 60),
    dailyGoal: intOf(e.dailyGoal, 20, 5, 100),
    createdAt: Date.now()
  };
  const next = [...userSubjects, subject];
  if (!saveJSON(STORAGE.subjects, next)) {
    toast('练习科目没有保存成功，请检查本地存储空间', 'error');
    return null;
  }
  userSubjects = next;
  return subject;
}

// 只更新考试信息、页头身份与练习参数：id / 名称 / 创建时间保持不变，写入前再过一遍 sanitize
function updateSubject(id, patch) {
  const current = userSubjects.find((s) => s.id === id);
  if (!current) return null;
  const merged = sanitizeSubjects([{ ...current, ...patch, id: current.id, name: current.name, createdAt: current.createdAt }])[0];
  if (!merged) return null;
  const next = userSubjects.map((s) => (s.id === id ? merged : s));
  if (!saveJSON(STORAGE.subjects, next)) {
    toast('修改没有保存成功', 'error');
    return null;
  }
  userSubjects = next;
  return merged;
}

function renameSubject(id, name) {
  const clean = String(name || '').trim().slice(0, 40);
  const subject = userSubjects.find((s) => s.id === id);
  if (!subject) return false;
  if (!clean) { toast('练习科目名称不能为空', 'info'); return false; }
  if (subjectNameTaken(clean, id)) { toast('已经有同名练习科目了', 'info'); return false; }
  // 改名不再顺手重写图标：用户选定的身份要留在原处，没选过的才由自动配图按新名字重算。
  const next = userSubjects.map((s) => (s.id === id ? { ...s, name: clean } : s));
  if (!saveJSON(STORAGE.subjects, next)) { toast('重命名没有保存成功', 'error'); return false; }
  userSubjects = next;
  return true;
}

// ===== Exam Plan AI 联动：考点级深链 =====
// 入站解析 ?from=exam-plan[&v=1&plan=&level=&unit=&subject=&topic=&exam=&date=&task=]：
// 用与 Exam Plan 完全一致的算法算出考点钥匙，持久化联动关系，再定位/新增练习科目。
// 所有入站参数都按不可信输入处理；只保存联动上下文，不跨域读取对方的计划、练习集或资料。
// 协议常量与长度闸门见文件顶部（启动阶段读取 planLinks 前就必须可用）。

function planParam(params, name) {
  const raw = String(params.get(name) ?? '').trim();
  return raw.length > PLAN_PARAM_LIMITS[name] ? null : raw;
}

// 完整内容路径才算有效联动上下文：层级参与身份，练习科目显示名被截到 20 字也不影响这里
function sanitizePlanPath(raw) {
  const src = objOf(raw);
  const level = src.level === 'unit' || src.level === 'subtopic' ? src.level : '';
  const subject = strOf(src.subject, PLAN_PARAM_LIMITS.subject).trim();
  const unit = strOf(src.unit, PLAN_PARAM_LIMITS.unit).trim();
  const topic = strOf(src.topic, PLAN_PARAM_LIMITS.topic).trim();
  const exam = strOf(src.exam, PLAN_PARAM_LIMITS.exam).trim();
  if (!level || !subject || !unit || !topic) return null;
  return { level, exam, subject, unit, topic };
}

function sanitizePlanLink(raw) {
  const src = objOf(raw);
  const path = sanitizePlanPath(src.path);
  const planId = strOf(src.planId, PLAN_PARAM_LIMITS.plan).trim();
  const topicKey = strOf(src.topicKey, 40).trim();
  if (!path || !PLAN_ID_RE.test(planId) || !PLAN_TOPIC_KEY_RE.test(topicKey)) return null;
  const linkId = `${planId}:${topicKey}`;
  if (src.linkId && strOf(src.linkId, 200).trim() && strOf(src.linkId, 200).trim() !== linkId) return null;
  const ctx = objOf(src.sourceContext);
  const date = strOf(ctx.date, 20).trim();
  const now = new Date().toISOString();
  const linkedAt = PLAN_ISO_RE.test(strOf(src.linkedAt, 40).trim()) ? strOf(src.linkedAt, 40).trim() : now;
  const updatedAt = PLAN_ISO_RE.test(strOf(src.updatedAt, 40).trim()) ? strOf(src.updatedAt, 40).trim() : linkedAt;
  return {
    linkId,
    planId,
    topicKey,
    path,
    sourceContext: {
      date: PLAN_DATE_RE.test(date) ? date : '',
      task: strOf(ctx.task, PLAN_PARAM_LIMITS.task).trim()
    },
    subjectId: strOf(src.subjectId, 64).trim(),
    linkedAt,
    updatedAt
  };
}

// 损坏数据只丢联动记录，不能让整个应用起不来
function sanitizePlanLinks(raw) {
  const out = {};
  Object.entries(objOf(objOf(raw).links)).forEach(([key, item]) => {
    const link = sanitizePlanLink(item);
    if (!link || key !== link.linkId) return;
    const prev = out[link.linkId];
    if (prev && String(prev.updatedAt) >= String(link.updatedAt)) return;
    out[link.linkId] = link;
  });
  return { schemaVersion: PLAN_LINK_SCHEMA_VERSION, links: out };
}

// 写入前先读磁盘最新值再合并：本页内存里的旧状态不能覆盖别的记录
function putPlanLink(link) {
  const clean = sanitizePlanLink(link);
  if (!clean) return false;
  const fresh = sanitizePlanLinks(readStored(STORAGE.planLinks).value);
  const prev = fresh.links[clean.linkId];
  if (prev && String(prev.updatedAt) > String(clean.updatedAt)) {
    planLinkStore = fresh;
    return true;
  }
  fresh.links[clean.linkId] = clean;
  planLinkStore = fresh;
  return saveJSON(STORAGE.planLinks, fresh);
}

function transientPlanLink(link, subject) {
  return {
    subjectId: subject.id,
    subject: subject.name,
    topic: link.path.topic,
    exam: link.path.exam,
    level: link.path.level,
    unit: link.path.unit,
    planSubject: link.path.subject,
    planId: link.planId,
    topicKey: link.topicKey,
    linkId: link.linkId,
    linkedAt: link.linkedAt
  };
}

// ===== 联动 → 出题：练习集来源留痕与考点归属校验 =====
// set.source 只回答「这份练习集来自哪条联动关系」。
// 能不能用它回流考点成绩，取决于生成结果里是否真的存在目标知识点、
// 且确有题目归属到它（returnEnabled），不是「显示过横幅」就算数。

function normalizeFocusTitle(value) {
  return String(value === null || value === undefined ? '' : value)
    .normalize('NFKC')
    .replace(/[\u3000\u00a0\s]+/g, ' ')
    .trim()
    .toLowerCase();
}

// 展示标题比对：相等优先，其次互相包含（AI 常把「武昌起义」写成「武昌起义（1911 年）」）
function focusTitleMatches(a, b) {
  const left = normalizeFocusTitle(a);
  const right = normalizeFocusTitle(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

// 练习科目名与计划练习科目名可能不同（本地练习科目被改名），以联动记录里的路径练习科目为准
function sanitizeSetSource(raw, kpIds) {
  const src = objOf(raw);
  if (strOf(src.from, 20).trim() !== 'exam-plan') return null;
  const planId = strOf(src.planId, PLAN_PARAM_LIMITS.plan).trim();
  const topicKey = strOf(src.topicKey, 40).trim();
  const linkId = strOf(src.linkId, 200).trim();
  const path = sanitizePlanPath(src.path);
  if (!PLAN_ID_RE.test(planId) || !PLAN_TOPIC_KEY_RE.test(topicKey) || !path) return null;
  if (linkId && linkId !== `${planId}:${topicKey}`) return null;
  const kp = strOf(src.knowledgePointId, 40).trim();
  const linkedAt = strOf(src.linkedAt, 40).trim();
  // 回流必须指向一个真实存在的知识点，否则降级成纯留痕
  const returnEnabled = src.returnEnabled === true && !!kp && Array.isArray(kpIds) && kpIds.includes(kp);
  return {
    from: 'exam-plan',
    linkId: `${planId}:${topicKey}`,
    planId,
    topicKey,
    path,
    knowledgePointId: returnEnabled ? kp : '',
    returnEnabled,
    linkedAt: PLAN_ISO_RE.test(linkedAt) ? linkedAt : ''
  };
}

// 目标知识点必须唯一：多个候选同名时宁可承认「归属不了」，也不猜一个
function findFocusKnowledgePoint(set, topic) {
  const hits = ((set && set.knowledgePoints) || []).filter((kp) => kp && focusTitleMatches(kp.title, topic));
  return hits.length === 1 ? hits[0] : null;
}

function attachGeneratedSource(set, snapshot) {
  if (!set || !snapshot || !snapshot.linkId || !snapshot.topicKey || !snapshot.planId) return set;
  const source = {
    from: 'exam-plan',
    linkId: snapshot.linkId,
    planId: snapshot.planId,
    topicKey: snapshot.topicKey,
    path: {
      level: snapshot.level,
      exam: snapshot.exam,
      subject: snapshot.planSubject || snapshot.subject,
      unit: snapshot.unit,
      topic: snapshot.topic
    },
    knowledgePointId: '',
    returnEnabled: false,
    linkedAt: snapshot.linkedAt
  };
  const target = findFocusKnowledgePoint(set, snapshot.topic);
  if (target) {
    // 被默认塞进第一个知识点的题目不算归属，避免把无关题算成目标考点成绩
    const attributed = (set.questions || []).filter((q) => q.knowledgePointId === target.id && q.kpUnmatched !== true).length;
    if (attributed > 0) {
      source.knowledgePointId = target.id;
      source.returnEnabled = true;
    }
  }
  const clean = sanitizeSetSource(source, ((set.knowledgePoints) || []).map((kp) => kp.id));
  if (clean) set.source = clean;
  return set;
}

// ===== 联动 → 回程：考点成绩归因与回执 =====
// 归因只在练习完成的那一刻算一次，并把结果作为快照写进历史。
// 之后练习集被编辑、移动或删除，回程用的仍是这次练习的真实统计，
// 而不是拿新的练习集结构去重算旧成绩。

// 目标考点在本次作答里的计分情况；任何一环不可靠就返回 null，宁可不报也不虚报。
function planResultForAttempt(set, answers) {
  const src = set && set.source;
  if (!src || src.returnEnabled !== true || !src.knowledgePointId) return null;
  // 持久联动关系被清掉时不猜上下文：没有 link 就没有考点成绩可回
  if (!planLinkStore.links[src.linkId]) return null;
  if (!(set.knowledgePoints || []).some((kp) => kp && kp.id === src.knowledgePointId)) return null;
  const byQid = new Map((set.questions || []).map((q) => [q.id, q]));
  let graded = 0;
  let correct = 0;
  arrOf(answers).forEach((a) => {
    if (!a || !a.qid) return;
    const q = byQid.get(a.qid);
    if (!q) return;                        // 题目已被删除：这道题无法归因
    if (q.kpUnmatched === true) return;    // 兜底塞进第一个知识点的题不算目标考点
    if (q.knowledgePointId !== src.knowledgePointId) return;
    if (a.correct !== true && a.correct !== false) return; // 未评分题不进考点统计
    graded += 1;
    if (a.correct === true) correct += 1;
  });
  if (graded <= 0) return null; // 没有计分题就不输出考点正确率
  return {
    schemaVersion: 1,
    linkId: src.linkId,
    topicKey: src.topicKey,
    knowledgePointId: src.knowledgePointId,
    graded,
    correct
  };
}

// 历史快照要能挺过刷新和备份导入，但只认合法值：
// 钥匙对不上、题数非法或答对数超过计分数，整段快照一起丢，不做部分放行。
function sanitizePlanResult(raw) {
  const src = objOf(raw);
  if (Number(src.schemaVersion) !== 1) return null;
  const linkId = strOf(src.linkId, 200).trim();
  const topicKey = strOf(src.topicKey, 40).trim();
  const hit = PLAN_LINK_ID_RE.exec(linkId);
  if (!hit || hit[2] !== topicKey) return null;
  const knowledgePointId = strOf(src.knowledgePointId, 40).trim();
  const graded = Number(src.graded);
  const correct = Number(src.correct);
  if (!knowledgePointId || !Number.isInteger(graded) || graded <= 0 || graded > 1000) return null;
  if (!Number.isInteger(correct) || correct < 0 || correct > graded) return null;
  return { schemaVersion: 1, linkId, topicKey, knowledgePointId, graded, correct };
}

// 回程只指向预先配置的备考规划站点，绝不接受外部传来的 back 地址。
// path 原样带上，Exam Plan 入站后用同一算法重算 tk 并校验一致性。
function planReturnUrl(link, result) {
  const params = new URLSearchParams();
  params.set('from', 'starquiz');
  params.set('v', '1');
  params.set('plan', link.planId);
  params.set('tk', link.topicKey);
  params.set('level', link.path.level);
  params.set('subject', link.path.subject);
  params.set('unit', link.path.unit);
  params.set('topic', link.path.topic);
  if (link.path.exam) params.set('exam', link.path.exam);
  if (link.sourceContext && link.sourceContext.date) params.set('date', link.sourceContext.date);
  if (link.sourceContext && link.sourceContext.task) params.set('task', link.sourceContext.task);
  if (result) {
    params.set('attempt', String(result.attemptId));
    // 只作展示来源（练的是哪套题），Exam Plan 侧缺失时留空，不影响归因统计
    if (result.setId) params.set('set', String(result.setId));
    params.set('graded', String(result.graded));
    params.set('correct', String(result.correct));
    params.set('at', String(result.completedAt));
  }
  return `${EXAM_PLAN_URL}/?${params.toString()}`;
}

// 只带定位上下文、不带成绩的回程：横幅用它，避免拿旧成绩冒充本次练习
function planReturnHref(link) {
  return link ? planReturnUrl(link) : `${EXAM_PLAN_URL}/`;
}

function planCompletedTimeLabel(finishedAt) {
  const d = new Date(finishedAt);
  if (!Number.isFinite(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 回执卡片：只报本次归因到目标考点的计分情况，回程参数由这次 attempt 固定生成。
// 练习集被删或联动关系被清除时卡片不出现，页面退回普通行为。
function renderPlanReceiptCard(receipt) {
  if (!receipt || !receipt.result || !receipt.link) return '';
  const { result, link, attempt } = receipt;
  const pct = result.graded ? Math.round((result.correct / result.graded) * 100) : 0;
  const examPart = link.path.exam ? ` · ${esc(link.path.exam)}` : '';
  const href = planReturnUrl(link, {
    attemptId: attempt.id,
    setId: attempt.setId,
    graded: result.graded,
    correct: result.correct,
    completedAt: new Date(attempt.finishedAt).toISOString()
  });
  return `
    <div class="plan-link-banner plan-receipt" role="note">
      <div class="plan-link-main">
        <span class="plan-link-eyebrow">备考规划练习回执${examPart}</span>
        <span class="plan-link-text">目标考点「${esc(link.path.topic)}」本次计分 ${result.graded} 题，答对 ${result.correct} 题，正确率 ${pct}%。</span>
        <span class="plan-receipt-meta">${attempt.mode === 'exam' ? '考试模式' : '学习模式'} · ${planCompletedTimeLabel(attempt.finishedAt)} · 按题目归属统计，未评分题不计入</span>
      </div>
      <div class="plan-link-actions">
        <a class="btn btn-primary btn-sm" href="${href}">带回备考规划 ↗</a>
      </div>
    </div>`;
}

// attempt 与持久联动关系都齐了才构成一张回执；缺一就退回普通页面
function receiptForAttempt(attempt) {
  if (!attempt || !attempt.planResult) return null;
  const link = planLinkStore.links[attempt.planResult.linkId];
  if (!link) return null;
  return { attempt, link, result: attempt.planResult };
}

// 练习集这次练习里最近一条带考点成绩的记录；优先本页刚完成的那次。
function findPlanReceipt(setId) {
  const pageAttempt = state.lastPlanAttempt;
  const pool = arrOf(history).filter((a) => a && a.setId === setId && a.planResult);
  if (!pool.length) return null;
  const fresh = pageAttempt && receiptForAttempt(pool.find((a) => a.id === pageAttempt.id && a.setId === pageAttempt.setId));
  const receipt = fresh || receiptForAttempt(pool.slice().sort((x, y) => y.finishedAt - x.finishedAt)[0]);
  return receipt ? Object.assign({}, receipt, { isCurrent: !!fresh }) : null;
}

// 出题开始时冻结联动快照：异步期间关闭横幅或切换练习科目都不会串到别的考点
function captureFocusLink() {
  if (!planLink || planLink.subjectId !== aiSubjectId) return null;
  if (!planLink.linkId || !planLink.topicKey || !planLink.planId || !planLink.topic) return null;
  return Object.assign({}, planLink);
}

function clearPlanLinkParams() {
  try {
    const url = new URL(window.location.href);
    window.history.replaceState({}, '', url.pathname + url.hash);
    return true;
  } catch (e) {
    return false;
  }
}

// 解析入站参数：任一核心参数超长视为脏输入（返回 null）；
// v/plan/level/subject/unit/topic 不齐时 linked=false，按旧的普通跳转处理，不启用结果回流。
function readPlanLinkParams(params) {
  const subjectName = planParam(params, 'subject');
  const topic = planParam(params, 'topic');
  const exam = planParam(params, 'exam');
  const unit = planParam(params, 'unit');
  const planId = planParam(params, 'plan');
  if (subjectName === null || topic === null || exam === null || unit === null || planId === null) return null;
  const level = String(params.get('level') || '').trim();
  const date = String(params.get('date') || '').trim();
  const task = String(params.get('task') || '').trim();
  const linked = params.get('v') === '1'
    && PLAN_ID_RE.test(planId)
    && (level === 'unit' || level === 'subtopic')
    && !!subjectName && !!unit && !!topic;
  return {
    linked,
    planId,
    level,
    subjectName,
    unit,
    topic,
    exam,
    date: PLAN_DATE_RE.test(date) ? date : '',
    task: task.length <= PLAN_PARAM_LIMITS.task ? task : ''
  };
}

// ===== 考试级快照入站：把「这场考试的资料和真题」落到本地 =====
// 通道是同一个标签页的 window.name：不经过服务器、不跨域读对方存储，
// 只在用户自己点击「练这个考点」的那一次跳转里换一手数据，读到即清空。
// 任何异常都当成「没有快照」，页面退回今天的样子（自己上传资料），绝不半份导入。
function takeExamHandoff() {
  let raw = '';
  try { raw = String(window.name ?? ''); } catch (e) { return null; }
  try { window.name = ''; } catch (e) { /* 清不掉也要继续：快照只在这一次跳转里有意义 */ }
  if (!raw || raw.length > HANDOFF_LIMITS.maxJson) return null;
  if (raw.indexOf(HANDOFF_PROTOCOL) < 0) return null;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  return sanitizeExamHandoff(parsed);
}

function extOfName(name) {
  const hit = String(name || '').match(/\.([A-Za-z0-9]{1,8})$/);
  return hit ? hit[1].toLowerCase() : '';
}

function sanitizeExamHandoff(raw) {
  const src = objOf(raw);
  if (src.protocol !== HANDOFF_PROTOCOL || Number(src.version) !== HANDOFF_VERSION) return null;
  const planId = strOf(src.planId, 64).trim();
  if (!PLAN_ID_RE.test(planId)) return null;
  const exam = strOf(src.exam, PLAN_PARAM_LIMITS.exam).trim();
  const subject = strOf(src.subject, PLAN_PARAM_LIMITS.subject).trim();
  if (!exam && !subject) return null;

  const seen = new Set();
  const pieces = [];
  arrOf(src.materials).slice(0, HANDOFF_LIMITS.materials).forEach((item) => {
    const piece = objOf(item);
    const name = strOf(piece.name, HANDOFF_LIMITS.name).trim();
    const text = cleanMaterialText(strOf(piece.text, HANDOFF_LIMITS.text));
    if (!name) return;
    const chars = aiVisibleChars(text);
    if (chars < HANDOFF_LIMITS.minVisibleChars) return;
    const key = `${norm(name)}|${chars}`;
    if (seen.has(key)) return;
    seen.add(key);
    // 类型以 Exam Plan 的标签为准（真题/笔记是用户在 Plan 里选的），缺标签才本地猜一次
    const kind = piece.kind === 'exam' || piece.kind === 'note' ? piece.kind : aiGuessFileKind(text, name);
    pieces.push({ name, kind, text, chars, type: strOf(piece.type, 40).trim(), truncated: piece.truncated === true });
  });
  if (!pieces.length) return null;

  const level = src.level === 'unit' || src.level === 'subtopic' ? String(src.level) : '';
  return {
    planId,
    exam,
    subject,
    level,
    unit: strOf(src.unit, PLAN_PARAM_LIMITS.unit).trim(),
    topic: strOf(src.topic, PLAN_PARAM_LIMITS.topic).trim(),
    date: PLAN_DATE_RE.test(String(src.date || '')) ? String(src.date) : '',
    materials: pieces,
    omitted: arrOf(src.omitted).map((name) => strOf(name, HANDOFF_LIMITS.name).trim()).filter(Boolean).slice(0, 20),
  };
}

// 按「文件名 + 有效字数」去重：重复进入同一场考试不会把资料灌第二遍
// （和 M2 回执「重复返回不重复记录」是同一条原则）。
async function importExamHandoffMaterials(subject, expectedPlanId) {
  const snap = examHandoff;
  const result = { hasSnapshot: !!snap, added: [], skipped: 0, failed: 0, omitted: snap ? snap.omitted.length : 0, exam: snap ? snap.exam : '' };
  if (!snap || !subject) return result;
  // 快照和这条深链不是同一场考试（理论上只可能是标签页残留）：宁可不导入
  if (expectedPlanId && snap.planId !== expectedPlanId) return result;
  examHandoff = null;

  const existing = new Set(subjectMaterials(subject.id).map((m) => `${norm(m.name)}|${m.chars}`));
  let stamp = Date.now();
  for (const piece of snap.materials) {
    const key = `${norm(piece.name)}|${piece.chars}`;
    if (existing.has(key)) { result.skipped++; continue; }
    const record = {
      id: 'mat-' + stamp.toString(36) + Math.random().toString(36).slice(2, 5),
      subjectId: subject.id,
      name: piece.name,
      size: typeof Blob !== 'undefined' ? new Blob([piece.text]).size : piece.text.length,
      ext: extOfName(piece.name),
      kind: piece.kind,
      pages: 0,
      chars: piece.chars,
      addedAt: stamp,
      text: piece.text
    };
    stamp += 1;
    try {
      const saved = await saveMaterialRecord(record, null);
      materials.unshift(saved);
      existing.add(key);
      result.added.push(saved);
    } catch (e) {
      console.warn('[StarQuiz] 考试快照的资料没有写入本地资料库', piece.name, e);
      result.failed++;
    }
  }
  materials.sort((a, b) => b.addedAt - a.addedAt);
  return result;
}

// 出题弹窗直接带上这个练习科目里的全部资料：用户不用再手动选一遍
function openPractice(subject) {
  openAIModal(subject.id, subjectMaterials(subject.id).map((m) => m.id));
}

// 一句话说明这次跳转带来了什么：句子形状固定，便于 i18n 的 EN_PATTERNS 精确匹配，
// 失败/超量另起一条提示，不把它们拼进同一句里。
function planHandoffToast(result, subject) {
  const folder = `「${subject.name}」`;
  const held = subjectMaterials(subject.id).length;
  if (result.hasSnapshot && result.added.length) {
    return `已同步考试${folder}的资料与真题：新增 ${result.added.length} 份，可以直接出题`;
  }
  if (result.hasSnapshot) {
    return `考试${folder}的资料与真题都已在这里，可以直接出题`;
  }
  if (held) return `这次跳转没有带来新资料：已选入${folder}的 ${held} 份资料，可以直接出题`;
  return `考试${folder}里还没有资料：上传资料即可出题`;
}

function planHandoffWarnings(result) {
  const notes = [];
  if (result.failed) notes.push(`${result.failed} 份资料没能写入本地资料库，请手动重新上传`);
  if (result.omitted) notes.push(`另有 ${result.omitted} 份资料超过单次携带上限，需要手动上传`);
  return notes;
}

// 一场考试在 StarQuiz 里对应一个资料夹：名字优先用考试名，其次用练习科目名。
// 已有联动记录绑定的资料夹永远优先复用，避免同一场考试在不同时间落到两个地方。
function planFolderName(exam, subjectName) {
  return String(exam || subjectName || '').trim().slice(0, PLAN_PARAM_LIMITS.subject);
}

function resolvePlanFolder({ boundSubjectId, exam, subjectName }) {
  const bound = boundSubjectId ? subjectById(boundSubjectId) : null;
  if (bound) return bound;
  const name = planFolderName(exam, subjectName);
  if (!name) return null;
  const existing = allSubjects().find((s) => norm(s.name) === norm(name));
  if (existing) return existing;
  // 新建的资料夹要把考试名同时写进 examName，否则练习科目页的「目标考试」备考上下文是空的
  return createSubject(name, { examName: String(exam || '').trim() });
}

// 旧链接（缺少联动上下文）：定位/新建考试资料夹、导入随跳转带来的资料、预开 AI 出题弹窗
async function applyLegacyPlanLink(subjectName, topic, exam, planId) {
  clearPlanLinkParams();
  const subject = resolvePlanFolder({ exam, subjectName });

  if (!subject) {
    planLink = { subjectId: null, subject: subjectName, topic, exam };
    navigateTo('sets');
    toast(topic ? `来自备考规划：练「${topic}」。请先选择或新增一个练习科目。` : '来自备考规划：请选择或新增一个练习科目开始出题。', 'info', 6000);
    return;
  }

  planLink = { subjectId: subject.id, subject: subject.name, topic, exam };
  const imported = await importExamHandoffMaterials(subject, planId);
  openSubject(subject.id);
  openPractice(subject);
  toast(planHandoffToast(imported, subject), 'info', 6000);
  planHandoffWarnings(imported).forEach((note) => toast(note, 'info', 6000));
}

async function applyPlanDeepLink() {
  let params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { return; }
  if (params.get('from') !== 'exam-plan') return;

  const parsed = readPlanLinkParams(params);
  const keyApi = globalThis.StarQuizTopicKey;
  if (!parsed || !parsed.linked || !keyApi) {
    // 参数超长或没有联动上下文：按旧的普通跳转处理，仍做长度保护
    const loose = parsed || {
      subjectName: String(params.get('subject') || '').trim().slice(0, PLAN_PARAM_LIMITS.subject),
      topic: String(params.get('topic') || '').trim().slice(0, PLAN_PARAM_LIMITS.topic),
      exam: String(params.get('exam') || '').trim().slice(0, PLAN_PARAM_LIMITS.exam)
    };
    applyLegacyPlanLink(loose.subjectName, loose.topic, loose.exam, (parsed && parsed.planId) || '');
    return;
  }

  const { planId, level, subjectName, unit, topic, exam, date, task } = parsed;
  let topicKey = '';
  try {
    topicKey = await keyApi.topicKey({ level, subject: subjectName, unit, topic });
  } catch (e) {
    console.warn('[StarQuiz] 考点钥匙计算失败，退化为普通跳转', e);
    applyLegacyPlanLink(subjectName, topic, exam, planId);
    return;
  }
  const linkId = keyApi.composeLinkId(planId, topicKey);
  const existingLink = planLinkStore.links[linkId] || null;

  // 已有联动记录就复用它绑定的资料夹；资料夹被删过则回落到考试名（其次练习科目名）匹配，最后才新建
  const subject = resolvePlanFolder({
    boundSubjectId: existingLink && existingLink.subjectId ? existingLink.subjectId : '',
    exam,
    subjectName
  });
  if (!subject) {
    planLink = { subjectId: null, subject: subjectName, topic, exam };
    navigateTo('sets');
    toast(`来自备考规划：练「${topic}」。请先选择或新增一个练习科目。`, 'info', 6000);
    return;
  }

  const now = new Date().toISOString();
  const link = {
    linkId,
    planId,
    topicKey,
    path: { level, exam, subject: subjectName, unit, topic },
    sourceContext: { date, task },
    subjectId: subject.id,
    linkedAt: existingLink ? existingLink.linkedAt : now,
    updatedAt: now
  };

  // 先持久化，成功后才清理地址栏：存储失败时保留可重试的联动上下文
  if (!putPlanLink(link)) {
    planLink = transientPlanLink(link, subject);
    openSubject(subject.id);
    toast('联动关系没有保存成功，请检查浏览器本地存储空间后重新进入', 'error', 6000);
    return;
  }

  planLink = transientPlanLink(link, subject);
  clearPlanLinkParams();
  const imported = await importExamHandoffMaterials(subject, planId);
  openSubject(subject.id);
  if (existingLink) {
    // 重复进入同一个考点：复用关系与资料夹，不重复建数据、不重复自动弹窗
    const extra = imported.added.length ? `，这次补入 ${imported.added.length} 份资料和真题` : '';
    toast(`继续「${subject.name}」的考点「${topic}」练习${extra}`, 'info', 5000);
    return;
  }
  openPractice(subject);
  toast(planHandoffToast(imported, subject), 'info', 6000);
  planHandoffWarnings(imported).forEach((note) => toast(note, 'info', 6000));
}

// 资料夹里的内容按类型说一句「笔记 X 份、真题 Y 份」：与出题向导里的说法保持一致
function planMaterialCountLine(subjectId) {
  const mats = subjectMaterials(subjectId);
  if (!mats.length) return '';
  const papers = mats.filter((m) => m.kind === 'exam').length;
  const notes = mats.length - papers;
  if (!papers) return `${mats.length} 份资料`;
  if (!notes) return `真题 ${papers} 份`;
  return `笔记 ${notes} 份、真题 ${papers} 份`;
}

// 练习科目页顶部：备考规划上下文横幅 + 返回入口（仅当深链指向本练习科目时显示）
function renderPlanLinkBanner(subjectId) {
  if (!planLink || planLink.subjectId !== subjectId) return '';
  const topic = planLink.topic ? esc(planLink.topic) : '';
  const exam = planLink.exam ? esc(planLink.exam) : '';
  const ctx = topic ? `考点「${topic}」` : '这个练习科目';
  const examPart = exam ? ` · ${exam}` : '';
  const held = planMaterialCountLine(subjectId);
  const hint = held
    ? `围绕${ctx}出题练习：这场考试的资料已在这个练习科目里（${held}），可直接出题。`
    : `围绕${ctx}出题练习：上传对应资料，AI 会生成题目并归入本练习科目。`;
  // 横幅只负责带回原考点，不带任何成绩：这里没有「本次练习」可依附
  const back = planReturnHref(planLinkStore.links[planLink.linkId]);
  return `
    <div class="plan-link-banner" role="note">
      <div class="plan-link-main">
        <span class="plan-link-eyebrow">来自备考规划${examPart}</span>
        <span class="plan-link-text">${hint}</span>
      </div>
      <div class="plan-link-actions">
        <a class="btn btn-secondary btn-sm" href="${back}">返回备考规划 ↗</a>
        <button type="button" class="btn btn-ghost btn-sm" onclick="dismissPlanLink()" aria-label="关闭提示">×</button>
      </div>
    </div>`;
}

// AI 出题弹窗内：当深链指向当前练习科目时，提示聚焦的考点
function renderPlanLinkNote() {
  if (!planLink || planLink.subjectId !== aiSubjectId) return '';
  const topic = planLink.topic ? esc(planLink.topic) : '';
  const exam = planLink.exam ? esc(planLink.exam) : '';
  const examPart = exam ? `（${exam}）` : '';
  const held = planMaterialCountLine(aiSubjectId);
  const line = topic
    ? (held
      ? `备考规划聚焦考点「${topic}」${examPart}：这场考试的资料已在这里（${held}），可直接出题。`
      : `备考规划聚焦考点「${topic}」${examPart}：上传这个考点的资料，AI 会据此出题。`)
    : (held
      ? `来自备考规划${examPart}：这场考试的资料已在这里（${held}），可直接出题。`
      : `来自备考规划${examPart}：上传资料即可为这个练习科目出题。`);
  return `
    <div class="ai-note plan-link-note">
      <span class="ai-note-dot"></span>
      <span>${line} <a class="link-btn" href="${EXAM_PLAN_URL}" target="_blank" rel="noopener noreferrer">返回备考规划 ↗</a></span>
    </div>`;
}

// 生成结果里的目标考点归属：只有校验通过才开放练习结果回流
function renderFocusAttribution(set, snapshot) {
  if (!snapshot || !snapshot.topic) return '';
  const topic = esc(snapshot.topic);
  if (set.source && set.source.returnEnabled) {
    const n = (set.questions || []).filter((q) => q.knowledgePointId === set.source.knowledgePointId && q.kpUnmatched !== true).length;
    return `<div class="text-muted">联动考点：${topic} 已归入 ${n} 题，练习结果可回流</div>`;
  }
  return `<div class="text-muted">联动考点：${topic} 没有可靠归属，本练习集只记录来源</div>`;
}

function dismissPlanLink() {
  // 只收起本页的临时提示；持久联动关系留在 sq_plan_links_v1，删除练习科目也不物理删除历史关系
  planLink = null;
  render();
}

const MATERIAL_DB = 'starquiz-materials';
const MATERIAL_STORE = 'materials';
const MATERIAL_FILE_STORE = 'files';
let materialDbPromise = null;

function openMaterialDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('当前浏览器不支持本地资料库'));
  if (!materialDbPromise) {
    materialDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(MATERIAL_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MATERIAL_STORE)) db.createObjectStore(MATERIAL_STORE, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(MATERIAL_FILE_STORE)) db.createObjectStore(MATERIAL_FILE_STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('资料库打开失败'));
    });
  }
  return materialDbPromise;
}

function dbRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('资料库读写失败'));
  });
}

async function loadMaterials() {
  try {
    const db = await Promise.race([
      openMaterialDb(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('资料库打开超时')), 3500))
    ]);
    const list = await dbRequest(db.transaction(MATERIAL_STORE, 'readonly').objectStore(MATERIAL_STORE).getAll());
    materials = arrOf(list).map(sanitizeMaterialMeta).filter(Boolean);
    materials.sort((a, b) => b.addedAt - a.addedAt);
  } catch (e) {
    console.warn('[StarQuiz] 资料库不可用', e);
    materialsUnavailable = true;
  } finally {
    materialsReady = true;
  }
}

// 原始文件最多留 20MB 一份；超出或写入失败时只保留提取的文字
async function saveMaterialRecord(meta, blob) {
  if (materialsUnavailable) throw new Error('当前浏览器无法保存资料，请改用支持的浏览器');
  const db = await openMaterialDb();
  const record = { ...meta, hasBlob: !!blob };
  const tx = db.transaction([MATERIAL_STORE, MATERIAL_FILE_STORE], 'readwrite');
  tx.objectStore(MATERIAL_STORE).put(record);
  if (blob) tx.objectStore(MATERIAL_FILE_STORE).put({ id: meta.id, blob });
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('资料没有写入成功'));
    tx.onabort = () => reject(tx.error || new Error('资料没有写入成功'));
  });
  return record;
}

// 把一份资料换到别的练习科目：只重写元数据，原始文件行保持不动（hasBlob 不变）
async function moveMaterialMeta(materialId, subjectId) {
  if (materialsUnavailable) return false;
  const meta = materials.find((m) => m.id === materialId);
  if (!meta || !subjectById(subjectId)) return false;
  try {
    const db = await openMaterialDb();
    const tx = db.transaction(MATERIAL_STORE, 'readwrite');
    tx.objectStore(MATERIAL_STORE).put({ ...meta, subjectId });
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('资料换练习科目失败'));
      tx.onabort = () => reject(tx.error || new Error('资料换练习科目失败'));
    });
    meta.subjectId = subjectId;
    return true;
  } catch (e) {
    console.warn('[StarQuiz] 资料换练习科目失败', e);
    return false;
  }
}

async function deleteMaterialRecord(id) {
  const db = await openMaterialDb();
  const tx = db.transaction([MATERIAL_STORE, MATERIAL_FILE_STORE], 'readwrite');
  tx.objectStore(MATERIAL_STORE).delete(id);
  tx.objectStore(MATERIAL_FILE_STORE).delete(id);
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('删除失败'));
    tx.onabort = () => reject(tx.error || new Error('删除失败'));
  });
}

async function readMaterialBlob(id) {
  try {
    const db = await openMaterialDb();
    const row = await dbRequest(db.transaction(MATERIAL_FILE_STORE, 'readonly').objectStore(MATERIAL_FILE_STORE).get(id));
    return row && row.blob ? row.blob : null;
  } catch {
    return null;
  }
}

function setStats(setId) {
  const attempts = history.filter((a) => a.setId === setId);
  const graded = attempts.reduce((n, a) => n + (a.graded || 0), 0);
  const correct = attempts.reduce((n, a) => n + (a.correct || 0), 0);
  const best = attempts.length ? Math.max(...attempts.map((a) => a.score || 0)) : null;
  return {
    attempts: attempts.length,
    accuracy: graded ? Math.round((correct / graded) * 100) : null,
    best
  };
}

function overallStats() {
  const count = history.length;
  const graded = history.reduce((n, a) => n + (a.graded || 0), 0);
  const correct = history.reduce((n, a) => n + (a.correct || 0), 0);
  const answered = history.reduce((n, a) => n + (a.total || 0), 0);
  const avg = count ? Math.round(history.reduce((n, a) => n + (a.score || 0), 0) / count) : null;
  const totalQ = allSets().reduce((n, s) => n + s.questions.length, 0);
  return { count, graded, correct, answered, avg, accuracy: graded ? Math.round((correct / graded) * 100) : null, totalQ };
}

/* 进度口径全站只用这一个：历史 attempt 的 answers[].qid 是唯一来源，
   学习模式和考试的随机抽题都会写它，所以首页宫格、列表行、结果页说的是同一件事。 */
function setProgress(setId) {
  const set = getSet(setId);
  if (!set) return { done: 0, total: 0 };
  const seen = new Set();
  history.forEach((a) => {
    if (a.setId !== setId) return;
    (Array.isArray(a.answers) ? a.answers : []).forEach((ans) => {
      if (ans && ans.qid) seen.add(ans.qid);
    });
  });
  return { done: Math.min(seen.size, set.questions.length), total: set.questions.length };
}

function subjectProgress(subjectId) {
  return subjectSets(subjectId).reduce((acc, s) => {
    const p = setProgress(s.id);
    acc.done += p.done;
    acc.total += p.total;
    return acc;
  }, { done: 0, total: 0 });
}

// 待答完的题数：首页所有「还剩多少」都从这里算，不在渲染函数里各算各的
function pendingQuestionCount(setIds) {
  return setIds.reduce((n, id) => {
    const p = setProgress(id);
    return n + Math.max(0, p.total - p.done);
  }, 0);
}

function hasPendingQuestions(setId) {
  return pendingQuestionCount([setId]) > 0;
}

/* —— 错题本读取口径：全站都从这里取，视图层不再自己遍历 bySet —— */

// 题目被删掉的条目直接不显示（也不显示「已掌握」的归档），保证本子里没有幽灵错题
function wrongItems(setId = '') {
  const out = [];
  Object.keys(wrongBank.bySet).forEach((sid) => {
    if (setId && sid !== setId) return;
    const set = getSet(sid);
    if (!set) return;
    const entries = objOf(wrongBank.bySet[sid]);
    Object.keys(entries).forEach((qid) => {
      const entry = normalizeWrongEntry(entries[qid]);
      const q = getQuestion(set, qid);
      if (!entry || !q) return;
      out.push({ setId: sid, qid, entry, q, set, dueAt: wrongDueAt(entry) });
    });
  });
  return out;
}

function wrongOpenItems(setId = '') {
  return wrongItems(setId).filter((i) => i.entry.status === 'open');
}

// 间隔不入库，只从「最近一次答错 + 次数」算出来：改算法不会留下过期的复习计划
function wrongIntervalDays(entry) {
  if (!entry) return WRONG_SPACING[0];
  if (entry.times >= WRONG_STUBBORN_TIMES) return 1;
  return WRONG_SPACING[Math.max(0, Math.min(WRONG_SPACING.length - 1, entry.times - 1))];
}

function isStubbornWrong(entry) {
  return !!entry && entry.times >= WRONG_STUBBORN_TIMES;
}

function wrongDueAt(entry) {
  if (!entry || entry.status !== 'open') return null;
  const base = entry.lastWrongAt || entry.firstWrongAt;
  // 练习历史也被清掉时没有任何时间依据：当作立刻到期，别再让这道题永远看不见
  return base ? base + wrongIntervalDays(entry) * WRONG_DAY_MS : 0;
}

function wrongIsDue(entry, now = Date.now()) {
  const due = wrongDueAt(entry);
  return due !== null && due <= now;
}

function wrongKpTitle(item) {
  const id = item.entry.kpId || strOf(item.q.knowledgePointId, 40);
  const kp = arrOf(item.set.knowledgePoints).find((k) => k && k.id === id);
  return kp ? strOf(kp.title, 60).trim() : '';
}

/* 按考点收纳：同名考点跨练习集合到一组（同一份计划生成的考点标题是一致的），
   没有考点归属的题落到「未归类」，不硬造一个考点。 */
function groupWrongByKp(items) {
  const groups = new Map();
  items.forEach((item) => {
    const title = wrongKpTitle(item);
    const key = title ? title.toLowerCase() : '';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title,
        items: [],
        setIds: new Set(),
        wrongTimes: 0,
        stubborn: 0,
        due: 0
      });
    }
    const g = groups.get(key);
    g.items.push(item);
    g.setIds.add(item.setId);
    g.wrongTimes += item.entry.times;
    if (isStubbornWrong(item.entry)) g.stubborn++;
    if (wrongIsDue(item.entry)) g.due++;
  });
  return [...groups.values()]
    .map((g) => ({ ...g, setIds: [...g.setIds] }))
    .sort((a, b) => b.stubborn - a.stubborn
      || b.wrongTimes - a.wrongTimes
      || b.items.length - a.items.length
      || a.title.localeCompare(b.title, 'zh-CN'));
}

// 组卷和排序都用这一个优先级：顽固的、错的多的、到期早的先练
function wrongPriorityCompare(a, b) {
  const sa = isStubbornWrong(a.entry) ? 1 : 0;
  const sb = isStubbornWrong(b.entry) ? 1 : 0;
  if (sa !== sb) return sb - sa;
  if (b.entry.times !== a.entry.times) return b.entry.times - a.entry.times;
  const da = a.dueAt === null ? Infinity : a.dueAt;
  const db = b.dueAt === null ? Infinity : b.dueAt;
  if (da !== db) return da - db;
  return (b.entry.lastWrongAt || 0) - (a.entry.lastWrongAt || 0);
}

// 四个数一次算完：导航角标、首页格子、错题本顶栏共用同一套口径
function wrongStats(setId = '') {
  const all = wrongItems(setId);
  const open = all.filter((i) => i.entry.status === 'open');
  const now = Date.now();
  const groups = groupWrongByKp(open);
  return {
    total: all.length,
    open: open.length,
    mastered: all.length - open.length,
    stubborn: open.filter((i) => isStubbornWrong(i.entry)).length,
    due: open.filter((i) => wrongIsDue(i.entry, now)).length,
    sets: new Set(open.map((i) => i.setId)).size,
    groups: groups.length,
    weakest: groups[0] || null
  };
}

// 从备考规划联动进来、但还没生成过练习集的考点：首页把它们当成一格待办
function pendingFocusLinks() {
  const links = Object.values((planLinkStore && planLinkStore.links) || {});
  if (!links.length) return [];
  const covered = new Set(allSets().map((s) => (s.source || {}).linkId).filter(Boolean));
  return links
    .filter((l) => l && l.linkId && !covered.has(l.linkId))
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

/* 首页只推一套「现在该练的」：上次那套还没做完就继续它；
   都做完了就推还剩题最多的新套；一套都没做过时按列表顺序推第一套。 */
function focusSet() {
  const usable = allSets().filter((s) => s.questions.length);
  if (!usable.length) return null;
  const last = history[0] ? getSet(history[0].setId) : null;
  if (last && last.questions.length && hasPendingQuestions(last.id)) return last;
  const pending = usable
    .filter((s) => hasPendingQuestions(s.id))
    .map((s) => ({ s, left: pendingQuestionCount([s.id]) }))
    .sort((a, b) => b.left - a.left)[0];
  if (pending) return pending.s;
  return last && last.questions.length ? last : usable[0];
}

// 交卷后的「练下一套」：顺着列表找第一套还没答完的，全答完就取下一套
function nextSetAfter(setId) {
  const usable = allSets().filter((s) => s.questions.length);
  if (!usable.length) return null;
  const i = usable.findIndex((s) => s.id === setId);
  for (let k = 1; k < usable.length; k++) {
    const cand = usable[((i < 0 ? -1 : i) + k) % usable.length];
    if (cand.id !== setId && hasPendingQuestions(cand.id)) return cand;
  }
  return usable[((i < 0 ? 0 : i) + 1) % usable.length] || null;
}

function streakDays() {
  const days = new Set(history.map((a) => todayStrOf(a.finishedAt)));
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = todayStrOf(d.getTime());
    if (days.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0 && key === todayStr()) {
      // 今天还没练习，从昨天开始算
      d.setDate(d.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function todayStrOf(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toast(msg, type = 'info', ms = 3000) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const glyphs = { success: '✓', error: '!', info: 'i' };
  el.innerHTML = `<span class="toast-glyph">${glyphs[type] || 'i'}</span><span>${esc(msg)}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  if (typeof applyLang === 'function') applyLang(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, ms);
}

function openModal(html, extraClass = '') {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal ${extraClass}">${html}</div>
    </div>`;
  if (typeof applyLang === 'function') applyLang(document.getElementById('modalContainer'));
}

function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

function confirmModal(title, message, okText, onOk, danger = false) {
  window._confirmCb = onOk;
  openModal(`
    <div class="modal-header">
      <div class="modal-title">${esc(title)}</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body"><p class="text-sm" style="line-height:1.7">${esc(message)}</p></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" onclick="runConfirm()">${esc(okText)}</button>
    </div>`);
}

function runConfirm() {
  const cb = window._confirmCb;
  window._confirmCb = null;
  closeModal();
  if (typeof cb === 'function') cb();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* 侧栏收纳（对齐 Exam Plan AI）：桌面端可收起，收起后左上角留一个浮动展开按钮 */
const SIDEBAR_PREF_KEY = 'sq_sidebar_collapsed';

function sidebarCollapsed() {
  try { return localStorage.getItem(SIDEBAR_PREF_KEY) === '1'; } catch { return false; }
}

function applySidebarPref() {
  document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed());
}

function collapseSidebar() {
  document.body.classList.add('sidebar-collapsed');
  try { localStorage.setItem(SIDEBAR_PREF_KEY, '1'); } catch { /* 偏好存不下也不影响本次使用 */ }
}

function expandSidebar() {
  document.body.classList.remove('sidebar-collapsed');
  try { localStorage.setItem(SIDEBAR_PREF_KEY, '0'); } catch { /* 同上 */ }
}

// 导航只有一个来源：这一份配置同时喂给桌面侧栏和移动端底栏。
// 练习科目页已经合并了练习记录，所以「记录」不再是独立的一级入口——四项目录和 Exam Plan 侧栏同构。
// pin: 'bottom' 的项目在侧栏沉底（Exam Plan 也是只有设置沉底），移动端仍然只是底栏的一项。
const NAV_VIEWS = [
  { view: 'dashboard', label: '首页', icon: 'navHome' },
  { view: 'sets', label: '练习科目', icon: 'navFolder' },
  { view: 'wrong', label: '错题本', icon: 'navWrong' },
  { view: 'settings', label: '设置', icon: 'navGear', pin: 'bottom' }
];

// 全局动作只剩一个：新增练习科目。AI 出题永远按练习科目归属，入口在练习科目详情页与资料行，
// 不再在侧栏底部挂第二个「出题」按钮让人先选练习科目。
const NAV_ACTIONS = [
  { id: 'subject', label: '新增练习科目', icon: 'plus', onclick: 'newSubjectModal()' }
];

const addSubjectAction = () => NAV_ACTIONS.find((a) => a.id === 'subject');

function activeNavView() {
  // 练习科目详情和练习集详情仍然属于「练习科目」这条导航，高亮不能跟着页面名跑
  if (state.view === 'subject' || state.view === 'setDetail') return 'sets';
  return state.view;
}

function navItemHTML(item) {
  const active = activeNavView() === item.view;
  // 错题本角标只报「今天到期」：有积压但今天还没到复习时间时，不打扰
  const count = item.view === 'wrong' ? wrongStats().due : 0;
  return `<button type="button" class="ui-nav-item${active ? ' active' : ''}"
    data-view="${item.view}" onclick="navigateTo('${item.view}')"${active ? ' aria-current="page"' : ''}>
    <span class="nav-icon" aria-hidden="true">${ICON[item.icon] || ''}</span><span class="nav-label">${item.label}</span>
    ${count ? `<span class="nav-count">${count}</span>` : ''}
  </button>`;
}

function navActionsHTML(slot) {
  const only = addSubjectAction();
  if (slot === 'sidebar') {
    // 侧栏的新建入口在练习科目分组末尾，用虚线导航项的形态（对齐 Exam Plan NotionSidebar）
    return `<button type="button" class="ui-nav-item ui-nav-dashed" onclick="${only.onclick}">
      <span class="nav-icon" aria-hidden="true">${ICON[only.icon] || ''}</span><span class="nav-label">${only.label}</span>
    </button>`;
  }
  return `<button type="button" class="btn btn-primary btn-sm" onclick="${only.onclick}">${ICON[only.icon] || ''}${only.label}</button>`;
}

function renderNav() {
  const nav = document.getElementById('sidebarNav');
  if (nav) nav.innerHTML = NAV_VIEWS.filter((i) => !i.pin).map((i) => navItemHTML(i)).join('');
  const foot = document.getElementById('sidebarBottom');
  if (foot) foot.innerHTML = NAV_VIEWS.filter((i) => i.pin === 'bottom').map((i) => navItemHTML(i)).join('');
  const bar = document.getElementById('bottomNav');
  if (bar) bar.innerHTML = NAV_VIEWS.map((i) => navItemHTML(i)).join('');
  const head = document.getElementById('headerActions');
  if (head) head.innerHTML = navActionsHTML('header');
}

// 侧栏练习科目分组（对齐 Exam Plan NotionSidebar）：分组头带计数胶囊，行内只有色点 + 名称，
// 删除按钮悬停才出现，纯导航不带数字——题数在练习科目页的卡组里看。
function renderSidebarSubjects() {
  const host = document.getElementById('sidebarSubjects');
  if (!host) return;
  const subjects = visibleSubjects();
  const rows = subjects.map((s) => {
    const accent = setAccent({ id: s.id });
    const active = state.view === 'subject' && state.subjectId === s.id;
    return `<div class="side-row${active ? ' is-active' : ''}">
      <button type="button" class="side-row-main" onclick="openSubject('${s.id}')"${active ? ' aria-current="page"' : ''}>
        <span class="side-row-dot" aria-hidden="true" style="background:${accent.bar}"></span>
        <span class="side-row-name" data-no-i18n title="${esc(s.name)}">${esc(s.name)}</span>
      </button>
      <button type="button" class="side-row-del" onclick="deleteSubject('${s.id}')"
        title="删除此练习科目" aria-label="删除练习科目 ${esc(s.name)}">${ICON.trash}</button>
    </div>`;
  }).join('');
  host.innerHTML = `
    <div class="sidebar-group-head">
      <span>练习科目</span>
      <span class="ui-chip tabular-nums">${subjects.length}</span>
    </div>
    ${rows || '<p class="sidebar-empty">暂无练习科目</p>'}
    ${navActionsHTML('sidebar')}`;
}

const PAGE_TITLES = {
  dashboard: '首页',
  sets: '练习科目',
  subject: '练习科目',
  setDetail: '练习集',
  learning: '学习模式',
  exam: '考试模式',
  examResult: '考试结果',
  wrong: '错题本',
  settings: '设置'
};

function navigateTo(view) {
  if (state.exam && state.exam.grading) {
    toast('正在评分，请稍候完成', 'info');
    return;
  }
  if (state.exam && !state.exam.grading) {
    confirmModal('退出考试', '考试正在进行中，退出后本次作答将丢失，确定退出吗？', '退出考试', () => {
      clearExamTimer();
      clearSession('exam');
      state.exam = null;
      doNavigate(view);
    }, true);
    return;
  }
  if (state.view === 'learning' && state.learning && view !== 'learning') {
    finishLearning(true);
  }
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
  doNavigate(view);
}

function doNavigate(view) {
  state.view = view;
  if (view !== 'setDetail') state.setId = null;
  if (view !== 'subject' && view !== 'setDetail') state.subjectId = null;
  closeSidebar();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function openSubject(id) {
  if (state.view === 'learning' && state.learning) finishLearning(true);
  state.subjectId = id;
  state.view = 'subject';
  closeSidebar();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function openSet(id) {
  if (state.view === 'learning' && state.learning) finishLearning(true);
  state.setId = id;
  state.view = 'setDetail';
  closeSidebar();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

// 任何一处视图渲染出错都不应该让整页白屏：兜底页保留导出与重置入口
function render() {
  try {
    renderCore();
  } catch (err) {
    console.error('[StarQuiz] 渲染失败', err);
    renderCrash(err);
  }
  // 英文模式在渲染完成后就地替换文案；中文是源语言，applyLang 内部直接返回
  if (typeof applyLang === 'function') applyLang(document.documentElement);
}

function renderCrash(err) {
  const main = document.getElementById('mainContent');
  if (!main) return;
  document.body.classList.remove('focus-mode', 'qnav-open');
  const msg = (err && (err.message || String(err))) || '未知错误';
  main.innerHTML = `
    <div class="empty-state" role="alert">
      <div class="empty-state-title">页面出了点问题</div>
      <div class="empty-state-desc">你的数据没有被清除。建议先导出备份，再重新加载；如果反复出现，再考虑重置本地数据。</div>
      <div class="text-sm text-muted" style="margin:14px 0 20px;word-break:break-word">${esc(msg)}</div>
      <div class="btn-group" style="justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="exportData()">导出数据备份</button>
        <button class="btn btn-secondary" onclick="location.reload()">重新加载</button>
        <button class="btn btn-danger" onclick="resetAll()">重置本地数据</button>
      </div>
    </div>`;
}

function renderCore() {
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
  if (state.exam && state.exam.timerId) {
    clearInterval(state.exam.timerId);
    state.exam.timerId = null;
  }

  document.body.classList.toggle('focus-mode', state.view === 'learning' || state.view === 'exam');
  const pageTitle = state.view === 'subject'
    ? ((subjectById(state.subjectId) || {}).name || '练习科目')
    : PAGE_TITLES[state.view];
  const titleEl = document.getElementById('pageTitle');
  titleEl.textContent = pageTitle || '';
  /* 练习科目视图的页头标题就是用户起的练习科目名，英文模式下不参与翻译 */
  if (state.view === 'subject') titleEl.setAttribute('data-no-i18n', '');
  else titleEl.removeAttribute('data-no-i18n');
  // 导航与动作由同一份配置生成：侧栏、移动底栏、页头动作位都在 renderNav 里落地
  renderNav();
  renderSidebarSubjects();

  const main = document.getElementById('mainContent');
  switch (state.view) {
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'sets': main.innerHTML = renderSets(); break;
    case 'subject': main.innerHTML = renderSubject(); break;
    case 'setDetail': main.innerHTML = renderSetDetail(); break;
    case 'learning': main.innerHTML = renderLearning(); break;
    case 'exam': main.innerHTML = state.exam && state.exam.grading ? renderGrading() : renderExam(); break;
    case 'examResult': main.innerHTML = renderExamResult(); break;
    case 'wrong': main.innerHTML = renderWrongBook(); break;
    case 'settings': main.innerHTML = renderSettings(); break;
    default: main.innerHTML = renderDashboard();
  }

  const slot = document.getElementById('resumeSlot');
  if (slot) slot.innerHTML = renderResumeBar();

  if (state.view === 'exam' && state.exam && !state.exam.grading) startExamTimer();
  syncQnav();
}

/* 卡片解剖（对齐 Exam Plan AI）：统计卡 = 标签 + 淡图标 / 大号数字 / 说明或进度；
   note 走文案翻译，noteHTML 只给用户起的名（练习科目 / 考试），带 data-no-i18n 不参与翻译。
   练习科目与练习集卡 = 左侧 3px 色条 + 标题 + 胶囊计数 + 描述 + 图标元信息 + 进度 + 分隔页脚。 */
function statCard(label, value, opts) {
  const o = opts || {};
  const pct = typeof o.pct === 'number' ? Math.max(0, Math.min(100, Math.round(o.pct))) : null;
  const note = o.noteHTML
    ? `<div class="stat-note">${o.noteHTML}</div>`
    : (o.note ? `<div class="stat-note">${esc(o.note)}</div>` : '');
  return `
    <div class="stat">
      <div class="stat-head">
        <span class="stat-label">${esc(label)}</span>
        ${o.icon ? `<span class="stat-ico" aria-hidden="true">${o.icon}</span>` : ''}
      </div>
      <div class="stat-value">${value}</div>
      ${pct != null
        ? `<div class="stat-track"><div style="width:${pct}%"></div></div>${note}`
        : note}
    </div>`;
}

function subjectStats(subjectId) {
  const ids = new Set(subjectSets(subjectId).map((s) => s.id));
  const attempts = history.filter((a) => ids.has(a.setId));
  const graded = attempts.reduce((n, a) => n + (a.graded || 0), 0);
  const correct = attempts.reduce((n, a) => n + (a.correct || 0), 0);
  return { attempts: attempts.length, accuracy: graded ? Math.round((correct / graded) * 100) : null };
}

/* 首页是练习调度台，不是落地页也不是仪表盘：一张「今日练习」状态卡，
   主按钮带当前进度，四个格子对应四种练法，统计压成进度条下面一行胶囊。
   没有装饰性纹理、大情绪文案和英雄区，字段顺序对齐 Exam Plan AI 的今日视图。 */
function dailyGoalTotal() {
  const subjects = visibleSubjects();
  if (!subjects.length) return 20;
  return subjects.reduce((n, s) => n + (s.dailyGoal || 20), 0);
}

function todayDateLabel() {
  const d = new Date();
  try {
    return new Intl.DateTimeFormat(isEn() ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(d);
  } catch {
    return fmtDay(d.getTime());
  }
}

function daysToExam(subject) {
  if (!subject || !subject.examDate) return null;
  const target = new Date(`${subject.examDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

// 「最近考试」全站只算一次：首页胶囊和练习科目总览的统计卡说的是同一个练习科目、同一个 D-N
function nearestExamSubject() {
  return visibleSubjects()
    .map((s) => ({ s, left: daysToExam(s) }))
    .filter((x) => x.left != null && x.left >= 0)
    .sort((a, b) => a.left - b.left)[0] || null;
}

// 倒计时显示口径：已过日期和今天都显示「今天考试」，其余 D-N
function examCountdownLabel(left) {
  if (left == null) return '—';
  return left <= 0 ? '今天考试' : `D-${left}`;
}

// 全部练习题的完成进度：练习科目总览的「总进度」与单个练习科目卡共用同一口径
function overallProgress() {
  return allSets().reduce((acc, s) => {
    const p = setProgress(s.id);
    acc.done += p.done;
    acc.total += p.total;
    return acc;
  }, { done: 0, total: 0 });
}

// 首页只推一套「现在该练的」，主按钮的文案直接带上它的状态
function mainPracticeAction(focus, progress, hasSubjects) {
  if (!focus) {
    return { label: hasSubjects ? '挑一个练习科目' : '去建第一个练习科目', onclick: "navigateTo('sets')" };
  }
  const name = `<span data-no-i18n>${esc(focus.name)}</span>`;
  if (!progress.done) {
    return { label: `开始练习 · ${name} 共 ${progress.total} 题`, onclick: `startLearning('${focus.id}')` };
  }
  if (progress.done < progress.total) {
    return { label: `继续 · ${name} ${progress.done}/${progress.total} 题`, onclick: `startLearning('${focus.id}')` };
  }
  // 整套答完之后，最该做的不是再来一遍全量，而是今天到期的错题
  const dueWrong = wrongStats(focus.id).due;
  if (dueWrong) {
    return { label: `重练错题 · ${name} 今日到期 ${dueWrong} 题`, onclick: `startLearning('${focus.id}', true)` };
  }
  return { label: `再过一遍 · ${name} ${progress.total} 题`, onclick: `startLearning('${focus.id}')` };
}

// 考点聚焦格：把待练的联动考点装回临时上下文，再打开出题弹窗（默认已勾上聚焦这个考点）
function startFocusLink(linkId) {
  const link = planLinkStore.links[linkId];
  if (!link) {
    toast('这条联动关系已经不存在了', 'info');
    navigateTo('sets');
    return;
  }
  const topic = (link.path || {}).topic || '';
  const subject = resolvePlanFolder({
    boundSubjectId: link.subjectId || '',
    exam: (link.path || {}).exam || '',
    subjectName: (link.path || {}).subject || ''
  });
  if (!subject) {
    planLink = { subjectId: null, subject: (link.path || {}).subject || '', topic, exam: (link.path || {}).exam || '' };
    navigateTo('sets');
    toast(`先选一个练习科目，再练考点「${topic}」`, 'info', 6000);
    return;
  }
  planLink = transientPlanLink(link, subject);
  openAIModal(subject.id);
}

function renderDashboard() {
  const subjects = visibleSubjects();
  const st = overallStats();
  const streak = streakDays();
  const today = todayAnswered();
  const goal = dailyGoalTotal();
  const goalPct = Math.min(100, Math.round((today / goal) * 100));
  const focus = focusSet();
  const progress = focus ? setProgress(focus.id) : { done: 0, total: 0 };
  const cta = mainPracticeAction(focus, progress, subjects.length);
  const wrongToday = wrongStats();
  const focusLinks = pendingFocusLinks();
  const lastExam = history.find((a) => a.mode === 'exam');
  // 「待练」按还没答完的练习集数算，和主按钮说的是同一件事
  const pendingSets = allSets().filter((s) => s.questions.length && pendingQuestionCount([s.id]) > 0).length;
  const nearest = nearestExamSubject();

  const cell = (o) => `
    <button type="button" class="dispatch-cell" onclick="${o.onclick}">
      <span class="dispatch-label">${o.label}</span>
      <span class="dispatch-value">${o.value}</span>
      <span class="dispatch-note">${o.note}</span>
    </button>`;

  const chip = (content) => `<span class="today-chip">${content}</span>`;
  const chips = [];
  if (streak > 0) chips.push(chip(`连续 ${streak} 天`));
  if (pendingSets) chips.push(chip(`待练 ${pendingSets} 套`));
  if (nearest) {
    chips.push(chip(`<span data-no-i18n>${esc(nearest.s.examName || nearest.s.name)}</span>`));
    // 考试倒计时的落点就是改考试：日期定错了，点这枚胶囊直接进编辑弹窗，不再另开入口
    chips.push(`<button type="button" class="today-chip" onclick="examInfoModal('${nearest.s.id}')" title="编辑考试信息">${ICON.pen}<span>距考试 ${nearest.left} 天</span></button>`);
  }
  chips.push(chip(st.accuracy == null ? '还没有练习成绩' : `累计正确率 ${st.accuracy}%`));

  return `
    <div class="card today-card">
      <div class="today-head">
        <span class="ui-chip">今日</span>
        <span class="today-date" data-no-i18n>${esc(todayDateLabel())}</span>
      </div>
      <h2 class="today-title">今日练习</h2>
      <div class="today-track">
        <div class="today-track-head"><span>今日目标</span><b>${today} / ${goal} 题</b></div>
        <div class="ui-progress"><div style="width:${goalPct}%"></div></div>
        <div class="today-chips">${chips.join('')}</div>
      </div>
      <div class="today-actions">
        <button class="btn btn-primary" onclick="${cta.onclick}">${cta.label}</button>
      </div>
      ${focus ? `
        <div class="dispatch-grid">
          ${cell({
            label: '顺序练习',
            value: `${progress.done}<span class="dispatch-denom"> / ${progress.total} 题</span>`,
            note: `<span data-no-i18n>${esc(focus.name)}</span>`,
            onclick: `startLearning('${focus.id}')`
          })}
          ${cell({
            label: '错题重练',
            value: `${wrongToday.due}<span class="dispatch-denom"> 题今天到期</span>`,
            note: wrongToday.open ? `共 ${wrongToday.open} 题待复习` : '暂无错题',
            onclick: "navigateTo('wrong')"
          })}
          ${cell({
            label: '模拟考试',
            value: `${lastExam ? lastExam.score : '--'}<span class="dispatch-denom"> 分（上次）</span>`,
            note: lastExam ? '自检掌握度' : '还没有考过',
            onclick: `startExamModal('${focus.id}')`
          })}
          ${focusLinks.length ? cell({
            label: '考点聚焦',
            value: `${focusLinks.length}<span class="dispatch-denom"> 个考点待练</span>`,
            note: `<span data-no-i18n>${esc((focusLinks[0].path || {}).topic || '')}</span>`,
            onclick: `startFocusLink('${focusLinks[0].linkId}')`
          }) : ''}
        </div>` : ''}
    </div>
  `;
}

// 空状态只解释「这里为什么是空的」，并给出这一个动作：新增练习科目仍是全站唯一入口（侧栏虚线行 / 移动页头）
function renderEmptyFolders() {
  const a = addSubjectAction();
  return `
    <div class="empty-card">
      <div class="empty-card-icon">${ICON.book}</div>
      <div class="empty-card-title">还没有练习科目</div>
      <div class="empty-card-desc">建一个练习科目，把 PDF、Word、PPT 或文字资料放进去，再由 AI 整理成练习集；上传的资料、生成的练习集和练习成绩都收在同一个练习科目里。</div>
      <button type="button" class="btn btn-primary" onclick="${a.onclick}">${ICON.plus}<span>${a.label}</span></button>
    </div>`;
}

/* 紧凑列表行（对齐 Exam Plan 的清单）：色点 + 标题 + 计数胶囊 + 一行说明 + 右侧次要数据。
   练习科目页只保留「练习科目卡组」这一层收纳，练习科目内部（资料 / 练习集）仍用细线行。 */
function lrow(o) {
  return `
    <button type="button" class="lrow" onclick="${o.onclick}">
      <span class="lrow-dot" aria-hidden="true" style="background:${o.accent}"></span>
      <span class="lrow-main">
        <span class="lrow-title"><span class="lrow-name" data-no-i18n>${esc(o.title)}</span><span class="ui-chip tabular-nums">${o.chip}</span></span>
        ${o.sub ? `<span class="lrow-sub"${o.subUserData ? ' data-no-i18n' : ''}>${esc(o.sub)}</span>` : ''}
      </span>
      <span class="lrow-tail">${o.tail}</span>
      <span class="lrow-go" aria-hidden="true">→</span>
    </button>`;
}

function tailAccuracy(acc) {
  return acc == null
    ? '<span class="lrow-tail-idle">未练习</span>'
    : `<b>${acc}%</b><span class="lrow-tail-idle">正确率</span>`;
}

function renderSetRow(s) {
  const st = setStats(s.id);
  const p = setProgress(s.id);
  const kpCount = (s.knowledgePoints || []).length;
  return lrow({
    onclick: `openSet('${s.id}')`,
    accent: setAccent(s).bar,
    title: s.name,
    chip: `已做 ${p.done}/${p.total} 题`,
    sub: s.description || `${kpCount} 知识点 · ${st.attempts ? `已练 ${st.attempts} 次` : '还没有练过'}`,
    subUserData: !!s.description,
    tail: tailAccuracy(st.accuracy)
  });
}

/* 练习科目收纳（对齐 Exam Plan AI 的 CourseAccordionGallery）：
   桌面是一排横向卡——悬停或键盘聚焦的那张展开成 5 倍宽，其余收成 60px 只留旋转名称、D-N 和进度；
   移动端这排卡换成同一批练习科目的手风琴行。两个形态共用 subjectDeckData 与同一段进度 / 页脚，
   展开完全交给 CSS（.deck-card:hover），不靠重渲染，所以过渡不会被 innerHTML 打断。 */
function subjectDeckData(subject) {
  const sets = subjectSets(subject.id);
  const mats = subjectMaterials(subject.id);
  const progress = subjectProgress(subject.id);
  const left = daysToExam(subject);
  const ids = new Set(sets.map((s) => s.id));
  return {
    subject,
    sets,
    mats,
    left,
    progress,
    wrong: wrongOpenItems().filter((i) => ids.has(i.setId)).length,
    qCount: sets.reduce((n, s) => n + s.questions.length, 0),
    pct: progress.total ? Math.round((progress.done / progress.total) * 100) : 0,
    accent: setAccent({ id: subject.id })
  };
}

function deckFactLine(d) {
  const base = d.mats.length
    ? `${d.sets.length} 个练习集 · ${d.qCount} 道题 · ${d.mats.length} 份资料`
    : `${d.sets.length} 个练习集 · ${d.qCount} 道题`;
  return d.wrong ? `${base} · ${d.wrong} 题错题待复习` : base;
}

function deckProgressBlock(d) {
  return `
    <div class="deck-prog">
      <div class="deck-prog-head"><span>练习进度</span><b>${d.pct}%</b></div>
      <div class="ui-progress deck-bar"><div style="width:${d.pct}%"></div></div>
      <div class="deck-prog-sub">已做 ${d.progress.done}/${d.progress.total} 题</div>
    </div>`;
}

// 页脚动作：编辑（练习科目名 + 考试信息）与删除都是次要动作，主按钮「进入」留在右侧。
// 编辑必须摆在明面上：改考点、改考试日期是每天都会发生的事，不该藏进 ⋯ 里。
// 「未分类」是内置收纳位，改名和删除都不成立，所以和详情页页头一样只留「进入」。
function deckFootHTML(subject) {
  const acts = subject.builtin
    ? '<span></span>'
    : `<span class="deck-foot-acts">
        <button type="button" class="deck-act" onclick="event.stopPropagation();examInfoModal('${subject.id}')" title="编辑练习科目">${ICON.pen}<span>编辑</span></button>
        <button type="button" class="deck-act deck-act-danger" onclick="event.stopPropagation();deleteSubject('${subject.id}')" title="删除此练习科目">${ICON.trash}<span>删除</span></button>
      </span>`;
  return `
    <div class="deck-foot">
      ${acts}
      <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation();openSubject('${subject.id}')"><span>进入</span>${ICON.arrow}</button>
    </div>`;
}

function deckIdleFoot(d) {
  return `
    <div class="deck-idle-foot">
      ${d.left != null ? `<span class="deck-idle-days">${d.left <= 0 ? '今天' : `D-${d.left}`}</span>` : ''}
      <span class="deck-idle-pct">${d.pct}%</span>
      <span class="deck-idle-track" aria-hidden="true"><div style="width:${d.pct}%"></div></span>
    </div>`;
}

function deckCardHTML(d) {
  const s = d.subject;
  return `
    <article class="deck-card" role="button" tabindex="0" aria-label="打开练习科目 ${esc(s.name)}"
      onclick="openSubject('${s.id}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSubject('${s.id}')}">
      <span class="deck-stripe" aria-hidden="true" style="background:${d.accent.bar}"></span>
      <div class="deck-idle">
        <span class="deck-idle-name" data-no-i18n>${esc(s.name)}</span>
        ${deckIdleFoot(d)}
      </div>
      <div class="deck-full">
        <div class="deck-head">
          <button type="button" class="deck-title" onclick="openSubject('${s.id}')" title="${esc(s.name)}" data-no-i18n>${esc(s.name)}</button>
          ${d.left != null ? `<span class="ui-chip tabular-nums">${examCountdownLabel(d.left)}</span>` : ''}
        </div>
        ${s.examDate ? `<div class="deck-meta"><span class="deck-meta-ico" aria-hidden="true">${ICON.calendar}</span><span>${esc(s.examDate)}</span></div>` : ''}
        <div class="deck-sub">${deckFactLine(d)}</div>
        ${deckProgressBlock(d)}
        ${deckFootHTML(s)}
      </div>
    </article>`;
}

function deckFoldHTML(d) {
  const s = d.subject;
  return `
    <details class="fold">
      <summary class="fold-head">
        <span class="fold-dot" aria-hidden="true" style="background:${d.accent.bar}"></span>
        <span class="fold-copy">
          <span class="fold-name" data-no-i18n>${esc(s.name)}</span>
          <span class="fold-sub">${deckFactLine(d)}</span>
        </span>
        ${d.left != null ? `<span class="ui-chip tabular-nums">${examCountdownLabel(d.left)}</span>` : ''}
        <span class="fold-chev" aria-hidden="true">${ICON.chevron}</span>
      </summary>
      <div class="fold-body">
        ${deckProgressBlock(d)}
        ${deckFootHTML(s)}
      </div>
    </details>`;
}

// 新建卡：和练习科目卡同一套悬停展开，收起时是虚线窄条，展开后是创建说明 + 立即创建
function deckAddHTML() {
  const a = addSubjectAction();
  const open = `event.stopPropagation();${a.onclick}`;
  return `
    <div class="deck-card deck-add" role="button" tabindex="0" onclick="${a.onclick}"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${a.onclick}}"
      aria-label="${a.label}">
      <div class="deck-idle">
        <span class="deck-idle-tile" aria-hidden="true">${ICON.plus}</span>
        <span class="deck-idle-name">新增练习科目</span>
        <span class="deck-idle-go" aria-hidden="true">${ICON.arrow}</span>
      </div>
      <div class="deck-full">
        <div class="deck-add-head">
          <span class="deck-tile deck-tile-ink" aria-hidden="true">${ICON.plus}</span>
          <span>${a.label}</span>
        </div>
        <h3 class="deck-add-title">创建新的练习科目</h3>
        <p class="deck-add-desc">上传考试大纲、讲义或真题，AI 整理成练习集后归到这个练习科目下。</p>
        <div class="deck-foot">
          <span></span>
          <button type="button" class="btn btn-primary btn-sm" onclick="${open}">${ICON.plus}<span>立即创建</span></button>
        </div>
      </div>
    </div>`;
}

function foldAddHTML() {
  const a = addSubjectAction();
  return `
    <button type="button" class="fold fold-add" onclick="${a.onclick}">
      <span class="fold-dot fold-add-dot" aria-hidden="true">${ICON.plus}</span>
      <span class="fold-copy"><span class="fold-name">${a.label}</span></span>
      <span class="lrow-go" aria-hidden="true">→</span>
    </button>`;
}

/* 练习科目详情里的收纳：和移动端练习科目行同一个 .fold 组件（对齐 CourseDetailPage 的可折叠资料段），
   标题 + 计数胶囊 + 箭头，展开后是细线行列表。 */
function foldSection(o) {
  return `
    <details class="fold fold-section"${o.open ? ' open' : ''}>
      <summary class="fold-head">
        <span class="fold-copy"><span class="fold-name"${o.nameIsData ? ' data-no-i18n' : ''}>${esc(o.title)}</span></span>
        ${o.actions ? `<span class="fold-actions">${o.actions}</span>` : ''}
        ${o.chip ? `<span class="ui-chip tabular-nums">${o.chip}</span>` : ''}
        <span class="fold-chev" aria-hidden="true">${ICON.chevron}</span>
      </summary>
      <div class="fold-body fold-body-flush">${o.body}</div>
    </details>`;
}

/* 练习记录并入练习科目总览：这里只留「一共练成什么样」的一行摘要与按时间排列的历史，
   原来按练习集分组的表现在卡组里已经是每个练习科目的进度条，不再重复一遍。 */
function histRowHTML(a) {
  const tone = a.score >= 85 ? 'score-high' : a.score >= 60 ? 'score-mid' : 'score-low';
  return `
    <div class="perf-row">
      <span class="badge ${a.mode === 'exam' ? 'badge-primary' : 'badge-success'}">${a.mode === 'exam' ? '考试' : '学习'}</span>
      <div class="perf-copy">
        <div class="perf-name" data-no-i18n>${esc(a.setName)}</div>
        <div class="perf-sub">${fmtDate(a.finishedAt)} · ${fmtDuration(a.durationSec)} · ${a.graded || 0}/${a.total || 0} 题</div>
      </div>
      <div class="history-score ${tone}">${a.score}%</div>
    </div>`;
}

function renderHistorySection() {
  const st = overallStats();
  if (!history.length) {
    return `
      <div class="section-title"><span>练习记录<span class="section-count">0</span></span></div>
      <div class="card"><div class="material-empty">还没有练习记录。从练习科目里挑一套开始学习，成绩会自动记在这里。</div></div>`;
  }
  const head = history.slice(0, 8);
  const rest = history.slice(8);
  return `
    <div class="section-title">
      <span>练习记录<span class="section-count">${history.length}</span></span>
      <span class="text-sm text-muted">共 ${history.length} 次练习 · 平均 ${st.avg} 分 · 已批改 ${st.graded} 题</span>
    </div>
    <div class="card">
      ${head.map((a) => histRowHTML(a)).join('')}
      ${rest.length ? `
        <details class="hist-more">
          <summary>展开全部 ${history.length} 条</summary>
          ${rest.map((a) => histRowHTML(a)).join('')}
        </details>` : ''}
    </div>`;
}

function renderSets() {
  const subjects = visibleSubjects();
  const st = overallStats();
  const today = todayAnswered();
  const goal = dailyGoalTotal();
  const nearest = nearestExamSubject();
  const prog = overallProgress();
  const progPct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
  const deckData = subjects.map((s) => subjectDeckData(s));

  const deck = subjects.length
    ? `<div class="deck">${deckData.map(deckCardHTML).join('')}${deckAddHTML()}</div>
       <div class="deck-fold">${foldAddHTML()}${deckData.map(deckFoldHTML).join('')}</div>`
    : renderEmptyFolders();

  return `
    <p class="page-lead">按练习科目收纳：上传的资料、AI 生成的练习集和练习记录都在同一个练习科目下，进度与考试倒计时在这页总览。</p>

    <div class="stat-rail">
      ${statCard('练习科目', subjects.length, { icon: ICON.book, note: `共 ${st.totalQ} 道题` })}
      ${statCard('最近考试', nearest ? examCountdownLabel(nearest.left) : '—', {
        icon: ICON.calendar,
        noteHTML: nearest ? `<span data-no-i18n>${esc(nearest.s.name)}</span>` : '还没设考试日期'
      })}
      ${statCard('今日进度', `${today}<span class="stat-denom"> / ${goal} 题</span>`, {
        icon: ICON.flame,
        pct: goal ? Math.min(100, Math.round((today / goal) * 100)) : 0,
        note: today >= goal && goal ? '今日目标已达成' : `每日目标 ${goal} 题`
      })}
      ${statCard('练习进度', `${progPct}%`, {
        icon: ICON.chart,
        pct: progPct,
        note: st.count ? `已做 ${prog.done}/${prog.total} 题 · 正确率 ${st.accuracy == null ? '--' : st.accuracy + '%'}` : `共 ${prog.total} 道题待练`
      })}
    </div>

    <div class="section-title"><span>练习科目收纳<span class="section-count">${subjects.length}</span></span></div>
    ${deck}

    ${renderHistorySection()}`;
}

function materialExtLabel(ext) {
  const e = String(ext || '').toLowerCase();
  if (!e) return 'TXT';
  if (e === 'markdown') return 'MD';
  return e.toUpperCase().slice(0, 4);
}

function fmtSize(bytes) {
  const n = Number(bytes) || 0;
  if (n >= 1024 * 1024) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${n} B`;
}

function fmtDay(ts) {
  const d = new Date(Number(ts) || Date.now());
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function materialKindLabel(kind) {
  return kind === 'exam' ? '真题' : '笔记';
}

function renderMaterialRow(m) {
  return `
    <div class="material-row" data-material="${esc(m.id)}">
      <span class="material-ext">${esc(materialExtLabel(m.ext))}</span>
      <div class="material-main">
        <div class="material-name" data-no-i18n title="${esc(m.name)}">${esc(m.name)}</div>
        <div class="material-meta">${materialKindLabel(m.kind)} · ${fmtSize(m.size)} · ${m.chars.toLocaleString('zh-CN')} 字 · ${fmtDay(m.addedAt)}${m.hasBlob ? '' : ' · 仅文字'}</div>
      </div>
      <div class="material-actions">
        <button type="button" class="link-btn" onclick="previewMaterial('${m.id}')">预览</button>
        <button type="button" class="link-btn" onclick="useMaterialInAI('${m.id}')">出题</button>
        <button type="button" class="link-btn" onclick="downloadMaterial('${m.id}')">${m.hasBlob ? '下载' : '导出文字'}</button>
        <button type="button" class="link-btn link-danger" onclick="deleteMaterial('${m.id}')">删除</button>
      </div>
    </div>`;
}

/* 段内列表的溢出收纳：和练习记录、错题本同一个 .hist-more 机制——
   前 6 行直接可见，剩下的收进「展开其余 N 套」，页面高度不会被长列表撑走。 */
const SET_PREVIEW = 6;

function setListHTML(sets) {
  if (!sets.length) {
    return `<div class="material-empty">还没有练习集。让 AI 用资料出一套，或从其他练习科目移动过来。</div>`;
  }
  const rest = sets.slice(SET_PREVIEW);
  return `
    <div class="lrow-list">
      ${sets.slice(0, SET_PREVIEW).map((s) => renderSetRow(s)).join('')}
      ${rest.length ? `
        <details class="hist-more">
          <summary>展开其余 ${rest.length} 套</summary>
          ${rest.map((s) => renderSetRow(s)).join('')}
        </details>` : ''}
    </div>`;
}

// 页头动作：返回 + 本页独有的三个动作。有封面时同一组按钮浮在封面带上，
// 只多一层半透明白垫（ui-cover-chip），档位不变——一个功能仍然只有这一个入口。
function subjectHeadChrome(subject, covered, own, matIds) {
  const cls = covered ? 'ui-text-btn ui-cover-chip' : 'ui-text-btn';
  return `
    <button class="${cls}" onclick="navigateTo('sets')">← 全部练习科目</button>
    <div class="subject-actions">
      <button class="${cls}" onclick="openAIModal('${subject.id}'${matIds ? `, [${matIds}]` : ''})">${ICON.spark}<span>AI 出题</span></button>
      ${own ? `<button class="${cls}" onclick="examInfoModal('${subject.id}')" title="练习科目名称与考试信息都能改">${ICON.pen}<span>编辑</span></button>
      <button class="${cls} is-danger" onclick="deleteSubject('${subject.id}')">${ICON.trash}<span>删除</span></button>` : ''}
    </div>`;
}

// 属性 = 图标 + 定宽灰标签 + 同档不加粗取值；没填的走 ui-prop-empty 那档灰。
function subjectProp(iconKey, label, value, opts) {
  const o = opts || {};
  return `<span class="ui-prop"><span class="ui-prop-icon">${ICON[iconKey]}</span>`
    + `<span class="ui-prop-label">${label}</span>`
    + `<span class="ui-prop-value${o.muted ? ' ui-prop-empty' : ''}"${o.raw ? ' data-no-i18n' : ''}>${esc(value)}</span></span>`;
}

function subjectPropsHTML(subject, left) {
  const notSet = '未设定';
  return [
    subject.examName
      ? subjectProp('book', '目标考试', subject.examName, { raw: true })
      : subjectProp('book', '目标考试', notSet, { muted: true }),
    subject.examDate
      ? subjectProp('calendar', '考试日期', subject.examDate)
      : subjectProp('calendar', '考试日期', notSet, { muted: true }),
    left == null
      ? subjectProp('clock', '距考试', notSet, { muted: true })
      : subjectProp('clock', '距考试', examCountdownLabel(left)),
    subject.goal
      ? subjectProp('target', '备考目标', subject.goal, { raw: true })
      : subjectProp('target', '备考目标', notSet, { muted: true }),
    subjectProp('flame', '每日目标', `${subject.dailyGoal || 20} 题`)
  ].join('');
}

function renderSubject() {
  const subject = subjectById(state.subjectId);
  if (!subject) {
    return `<div class="empty-state"><div class="empty-state-title">练习科目不存在</div><div class="empty-state-desc">它可能已被删除</div><button class="btn btn-primary" onclick="navigateTo('sets')">返回练习科目</button></div>`;
  }
  // 练习集没有 createdAt，插入顺序就是生成顺序，所以倒序展示：AI 刚出的那套永远在最上面。
  const sets = subjectSets(subject.id).slice().reverse();
  const mats = subjectMaterials(subject.id);
  const qCount = sets.reduce((n, s) => n + s.questions.length, 0);
  const own = !subject.builtin;
  const matIds = mats.map((m) => `'${m.id}'`).join(',');
  const busy = !materialsReady;
  const chars = mats.reduce((n, m) => n + m.chars, 0).toLocaleString('zh-CN');
  const kpTotal = sets.reduce((n, s) => n + (s.knowledgePoints || []).length, 0);
  const left = daysToExam(subject);
  const covered = hasSubjectCover(subject);
  const chrome = subjectHeadChrome(subject, covered, own, matIds);

  return `
    ${covered ? `<div class="subject-cover">${subjectCoverHTML(subject)}<div class="subject-chrome is-float">${chrome}</div></div>` : ''}

    <div class="subject-head${covered ? ' is-covered' : ''}">
      ${covered ? '' : `<div class="subject-chrome is-static">${chrome}</div>`}
      <span class="ui-page-icon" data-no-i18n>${esc(subjectIcon(subject))}</span>
      <h2 class="ui-doc-title" data-no-i18n>${esc(subject.name)}</h2>
      <div class="subject-props">${subjectPropsHTML(subject, left)}</div>
      ${renderPlanLinkBanner(subject.id)}
    </div>

    <input type="file" id="subjectFileInput" multiple hidden
      accept=".pdf,.docx,.doc,.pptx,.txt,.md,.markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
      onchange="handleSubjectFileInput(this)">

    ${foldSection({
      open: true,
      title: '练习集',
      chip: `${sets.length} 个 · ${qCount} 题 · ${kpTotal} 个知识点`,
      body: setListHTML(sets)
    })}

    ${foldSection({
      title: '资料',
      chip: mats.length ? `${mats.length} 份 · ${chars} 字` : '还没有资料',
      actions: `<button type="button" class="link-btn" onclick="event.preventDefault();pickSubjectFiles()">＋ 上传资料</button>`,
      body: `
        <div class="material-list" id="materialList">
          ${mats.length
            ? mats.map((m) => renderMaterialRow(m)).join('')
            : `<div class="material-empty">${busy ? '正在读取资料…' : '还没有资料。上传 PDF、Word、PPT 或 TXT，文件会留在这个练习科目下。'}</div>`}
        </div>
        ${materialsUnavailable
          ? `<div class="feedback feedback-incorrect">当前浏览器无法使用本地资料库，上传的资料不会保存。请更换浏览器或关闭无痕模式。</div>`
          : '<div class="upload-status" id="subjectUploadStatus" hidden></div>'}`
    })}`;
}

// 新增练习科目向导：考试信息 → 上传资料 → 完成（对齐 Exam Plan AI 的三步向导）
const NS_STEPS = ['考试信息', '上传资料', '完成'];

function nsBlank() {
  return {
    step: 1, subjectId: null, name: '', icon: '', cover: '', examName: '', examDate: '', startDate: '', goal: '',
    defaultCount: 15, dailyGoal: 20, parsing: false, added: 0, chars: 0, failed: []
  };
}

let nsDraft = nsBlank();

function nsReset() {
  nsDraft = nsBlank();
}

function nsField(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// 考试信息表单：新建向导第一步和练习科目页的「考试信息」弹窗共用同一套字段
const EXAM_FORM_DEFAULTS = {
  id: '', subjectKind: '', name: '', icon: '', cover: '', examName: '', goal: '', examDate: '', startDate: '',
  defaultCount: 15, dailyGoal: 20
};

function examFormValues() {
  return {
    name: nsField('newSubjectName').trim(),
    icon: strOf(nsField('nsIcon'), 8).trim(),
    cover: coverOf(nsField('nsCover')),
    examName: nsField('nsExamName').trim(),
    goal: nsField('nsGoal').trim(),
    examDate: nsField('nsExamDate').trim(),
    startDate: nsField('nsStartDate').trim(),
    defaultCount: intOf(nsField('nsDefaultCount'), 15, 5, 60),
    dailyGoal: intOf(nsField('nsDailyGoal'), 20, 5, 100)
  };
}

/* 页图标与封面选择器：只在「编辑练习科目」弹窗里出现——新建向导第一步讲的是考试信息，
 * 身份（图标 / 封面）留到科目页的编辑里配，一个入口只管一件事。
 * 取值写进隐藏域，保存时由 examFormValues() 一并读出，不在弹窗里即时落库。 */
function iconGridHTML(current) {
  return PAGE_ICON_CHOICES.map((emoji) =>
    `<button type="button" class="icon-tile${emoji === current ? ' is-active' : ''}" data-icon="${esc(emoji)}" `
    + `onclick="pickExamIcon(this.dataset.icon)" aria-label="${esc(emoji)}">${emoji}</button>`).join('');
}

function coverStripHTML(value) {
  const tiles = COVER_PRESETS.map((preset) =>
    `<button type="button" class="cover-tile${value === `${PRESET_PREFIX}${preset.id}` ? ' is-active' : ''}" `
    + `style="background:${preset.background}" title="${preset.zh}" onclick="pickExamCover('${PRESET_PREFIX}${preset.id}')"></button>`).join('');
  const uploaded = coverImageSrc(value)
    ? `<button type="button" class="cover-tile is-active" style="background-image:url('${value}')" title="上传的图片"></button>`
    : '';
  return `<button type="button" class="cover-tile is-none${value ? '' : ' is-active'}" title="不用封面" onclick="pickExamCover('')">无</button>${tiles}${uploaded}`;
}

function examIdentityHtml(v) {
  return `
      <div class="wiz-field wiz-span">
        <span class="form-label">页图标</span>
        <input type="hidden" id="nsIcon" value="${esc(v.icon)}">
        <div class="icon-grid" id="nsIconPicker">${iconGridHTML(v.icon)}</div>
        <span class="wiz-help">不选就按科目名自动配；再点一次选中的图标可以取消。</span>
      </div>
      <div class="wiz-field wiz-span">
        <span class="form-label">封面</span>
        <input type="hidden" id="nsCover" value="${esc(v.cover)}">
        <div class="cover-strip" id="nsCoverPicker">${coverStripHTML(v.cover)}</div>
        <div class="cover-tools">
          <button type="button" class="btn btn-secondary btn-sm" onclick="pickCoverFile()">${ICON.upload}<span>上传图片</span></button>
          <span class="cover-hint">JPG / PNG / WebP，最长边压到 1600 存在本机。</span>
        </div>
        <input type="file" id="nsCoverInput" hidden accept="image/png,image/jpeg,image/webp,image/gif" onchange="onCoverFileSelected(this)">
      </div>`;
}

function pickExamIcon(emoji) {
  const input = document.getElementById('nsIcon');
  const grid = document.getElementById('nsIconPicker');
  if (!input || !grid) return;
  const next = input.value === emoji ? '' : emoji;
  input.value = next;
  grid.innerHTML = iconGridHTML(next);
}

function pickExamCover(value) {
  const input = document.getElementById('nsCover');
  const strip = document.getElementById('nsCoverPicker');
  if (!input || !strip) return;
  const next = coverOf(value);
  input.value = next;
  strip.innerHTML = coverStripHTML(next);
}

function pickCoverFile() {
  document.getElementById('nsCoverInput')?.click();
}

async function onCoverFileSelected(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  try {
    const data = await readCoverImage(file);
    pickExamCover(data);
    toast('封面已选好，保存后生效', 'success');
  } catch (err) {
    toast(coverErrorMessage(err && err.code), 'error');
  }
}

function examFieldsHtml(raw) {
  const v = { ...EXAM_FORM_DEFAULTS, ...(raw || {}) };
  const advOpen = v.defaultCount !== 15 || v.dailyGoal !== 20;
  return `
    <div class="wiz-grid">
      <div class="wiz-field wiz-span">
        <label class="form-label" for="newSubjectName">练习科目名称</label>
        <input class="form-input" id="newSubjectName" maxlength="40" placeholder="例如：导游业务、考研英语、高等数学" value="${esc(v.name)}" onkeydown="if(event.key==='Enter'){event.preventDefault();${v.subjectKind === 'edit' ? `submitExamInfo('${esc(v.id)}')` : 'nsNext()'}};">
        <span class="wiz-help">之后上传的资料和生成的练习集都会归到这个练习科目下。</span>
      </div>
      ${v.subjectKind === 'edit' ? examIdentityHtml(v) : ''}
      <div class="wiz-field">
        <label class="form-label" for="nsExamName">目标考试</label>
        <input class="form-input" id="nsExamName" maxlength="100" placeholder="例如：2026 年导游资格考试" value="${esc(v.examName)}">
      </div>
      <div class="wiz-field">
        <label class="form-label" for="nsGoal">备考目标</label>
        <input class="form-input" id="nsGoal" maxlength="60" placeholder="例如：一次通过 / 90 分以上" value="${esc(v.goal)}">
      </div>
      <div class="wiz-field">
        <label class="form-label" for="nsExamDate">考试日期</label>
        <input class="form-input" type="date" id="nsExamDate" value="${esc(v.examDate)}">
      </div>
      <div class="wiz-field">
        <label class="form-label" for="nsStartDate">开始练习日期</label>
        <input class="form-input" type="date" id="nsStartDate" value="${esc(v.startDate || todayStr())}">
      </div>
      <details class="wiz-adv wiz-span"${advOpen ? ' open' : ''}>
        <summary>高级设置</summary>
        <div class="wiz-grid">
          <div class="wiz-field">
            <label class="form-label" for="nsDefaultCount">默认题量（道）</label>
            <input class="form-input" type="number" id="nsDefaultCount" min="5" max="60" step="1" value="${v.defaultCount}">
            <span class="wiz-help">AI 出题和开始练习时默认用这个题量。</span>
          </div>
          <div class="wiz-field">
            <label class="form-label" for="nsDailyGoal">每日练习目标（道）</label>
            <input class="form-input" type="number" id="nsDailyGoal" min="5" max="100" step="1" value="${v.dailyGoal}">
            <span class="wiz-help">首页的今日目标按各练习科目目标累加。</span>
          </div>
        </div>
      </details>
    </div>`;
}

function nsCollectExamInfo() {
  Object.assign(nsDraft, examFormValues());
}

function nsExamInfo() {
  return {
    icon: nsDraft.icon || '',
    cover: nsDraft.cover || '',
    examName: nsDraft.examName,
    examDate: nsDraft.examDate,
    startDate: nsDraft.startDate,
    goal: nsDraft.goal,
    defaultCount: nsDraft.defaultCount,
    dailyGoal: nsDraft.dailyGoal
  };
}

function nsRail() {
  return `<div class="wiz-steps" role="list">
    ${NS_STEPS.map((label, i) => {
      const n = i + 1;
      const cls = n === nsDraft.step ? 'is-current' : (n < nsDraft.step ? 'is-done' : 'is-idle');
      const inner = n < nsDraft.step
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`
        : String(n);
      const clickable = n < nsDraft.step && !nsDraft.parsing;
      return `${i > 0 ? '<span class="wiz-gap" aria-hidden="true"></span>' : ''}
        <div role="listitem" class="wiz-step ${cls}"${clickable ? ` onclick="nsGoTo(${n})"` : ''}${n === nsDraft.step ? ' aria-current="step"' : ''}>
          <span class="wiz-step-num">${inner}</span>
          <span class="wiz-step-label">${label}</span>
        </div>`;
    }).join('')}
  </div>`;
}

function nsLayerBody() {
  if (nsDraft.step === 1) {
    return `
      <div class="wiz-head">
        <span class="wiz-title">考试信息</span>
        <span class="wiz-hint">只有练习科目必填</span>
      </div>
      ${examFieldsHtml(nsDraft)}
      <p class="wiz-note">考试日期和备考目标之后还能在练习科目页里改。</p>`;
  }
  if (nsDraft.step === 2) {
    const subjectName = esc(nsDraft.name || (subjectById(nsDraft.subjectId) || {}).name || '新练习科目');
    return `
      <div class="wiz-head">
        <span class="wiz-title">上传资料</span>
        <span class="wiz-hint">可跳过 · 之后在练习科目里也能传</span>
      </div>
      <input type="file" id="nsFileInput" multiple hidden
        accept=".pdf,.docx,.doc,.pptx,.txt,.md,.markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
        onchange="handleNsFileInput(this)">
      <label class="ai-dropzone" for="nsFileInput">
        <span class="ai-dropzone-icon">${ICON.upload}</span>
        <span class="ai-dropzone-title">把资料放进「${subjectName}」</span>
        <span class="ai-dropzone-hint">点击选择或拖入 · PDF / Word / PPT / TXT · 可多选 · 单文件 ≤ 30MB</span>
      </label>
      <div class="upload-status" id="nsUploadStatus"${nsDraft.parsing ? '' : ' hidden'}>${nsDraft.parsing ? '正在解析资料…' : ''}</div>
      <div class="wiz-summary" id="nsSummary">${nsSummaryBits()}</div>
      <p class="wiz-note">扫描版 PDF 没有文字层，需要先 OCR；解析失败会在下面说明原因。</p>`;
  }
  const subject = subjectById(nsDraft.subjectId) || {};
  const mats = subjectMaterials(subject.id || '');
  const left = daysToExam(subject);
  return `
    <div class="wiz-head">
      <span class="wiz-title" data-no-i18n>${esc(subject.name || nsDraft.name)}</span>
      <span class="wiz-hint">已建好</span>
    </div>
    <div class="wiz-summary">
      <span class="wiz-chip"><b>${mats.length}</b> 份资料</span>
      <span class="wiz-chip"><b>${mats.reduce((n, m) => n + m.chars, 0).toLocaleString('zh-CN')}</b> 字可用</span>
      <span class="wiz-chip is-soft">每日目标 <b>${subject.dailyGoal || 20}</b> 题</span>
      ${left != null ? `<span class="wiz-chip is-soft">${left >= 0 ? `距考试 ${left} 天` : '考试日期已过'}</span>` : ''}
      ${nsDraft.failed.length ? `<span class="wiz-chip is-soft">${nsDraft.failed.length} 份未成功</span>` : ''}
    </div>
    <div style="margin-top:14px">
      <button type="button" class="wiz-choice" onclick="nsFinish('ai')">
        <span class="wiz-choice-main">
          <span class="wiz-choice-title">直接 AI 出题${mats.length ? `（用这 ${mats.length} 份资料）` : ''}</span>
          <span class="wiz-choice-desc">${mats.length ? '笔记生成新题，真题原样整理' : '先上传资料，或粘贴一段文字'}</span>
        </span>
        <span class="set-row-foot-go">开始 →</span>
      </button>
      <button type="button" class="wiz-choice" style="margin-top:8px" onclick="nsFinish('folder')">
        <span class="wiz-choice-main">
          <span class="wiz-choice-title">进入练习科目</span>
          <span class="wiz-choice-desc">先整理资料，稍后再出题</span>
        </span>
        <span class="set-row-foot-go">打开 →</span>
      </button>
    </div>`;
}

function nsSummaryBits() {
  const subject = subjectById(nsDraft.subjectId) || {};
  const mats = subjectMaterials(subject.id || '');
  const bits = [];
  if (mats.length) bits.push(`<span class="wiz-chip"><b>${mats.length}</b> 份资料已存入</span>`);
  if (mats.length) bits.push(`<span class="wiz-chip is-soft">${mats.reduce((n, m) => n + m.chars, 0).toLocaleString('zh-CN')} 字</span>`);
  nsDraft.failed.slice(0, 3).forEach((msg) => bits.push(`<span class="wiz-chip is-soft">${esc(msg)}</span>`));
  if (nsDraft.failed.length > 3) bits.push(`<span class="wiz-chip is-soft">另有 ${nsDraft.failed.length - 3} 份失败</span>`);
  return bits.join('');
}

function nsFooter() {
  if (nsDraft.step === 1) {
    return `<button class="btn btn-secondary" onclick="nsCancel()">取消</button>
      <button class="btn btn-primary" onclick="nsNext()">下一步：上传资料 ${ICON.arrow}</button>`;
  }
  if (nsDraft.step === 2) {
    return `<button class="btn btn-ghost btn-sm" onclick="nsBack()">← 考试信息</button>
      <span style="flex:1"></span>
      <button class="btn btn-secondary" onclick="nsSkip()">跳过资料</button>
      <button class="btn btn-primary" id="nsNextBtn" onclick="nsNext()"${nsDraft.parsing ? ' disabled' : ''}>完成 ${ICON.arrow}</button>`;
  }
  return `<button class="btn btn-ghost btn-sm" onclick="nsBack()">← 上一步</button>
    <span style="flex:1"></span>
    <button class="btn btn-secondary" onclick="closeModal()">稍后再说</button>`;
}

function nsRender() {
  const body = document.getElementById('nsBody');
  const foot = document.getElementById('nsFooter');
  const rail = document.getElementById('nsRail');
  if (rail) rail.innerHTML = nsRail();
  if (body) body.innerHTML = nsLayerBody();
  if (foot) foot.innerHTML = nsFooter();
  if (nsDraft.step === 1) setTimeout(() => document.getElementById('newSubjectName')?.focus(), 40);
  if (nsDraft.step === 2) setTimeout(() => bindNsDropzone(), 20);
}

function newSubjectModal() {
  nsReset();
  openModal(`
    <div class="modal-header">
      <div class="modal-title">新增练习科目</div>
      <button class="modal-close" onclick="nsCancel()">×</button>
    </div>
    <div class="modal-body">
      <div id="nsRail">${nsRail()}</div>
      <div id="nsBody" class="wiz-layer">${nsLayerBody()}</div>
    </div>
    <div class="modal-footer" id="nsFooter">${nsFooter()}</div>`, 'modal-wide');
}

function nsCancel() {
  if (nsDraft.parsing) { toast('资料还在解析中，先等它结束', 'info'); return; }
  nsReset();
  closeModal();
}

function nsBack() {
  if (nsDraft.parsing || nsDraft.step === 1) return;
  nsDraft.step -= 1;
  nsRender();
}

function nsGoTo(n) {
  if (nsDraft.parsing || n >= nsDraft.step) return;
  nsDraft.step = n;
  nsRender();
}

function nsSkip() {
  nsDraft.step = 3;
  nsRender();
}

function nsNext() {
  if (nsDraft.step === 1) {
    nsCollectExamInfo();
    if (!nsDraft.name) {
      toast('请填写练习科目', 'info');
      document.getElementById('newSubjectName')?.focus();
      return;
    }
    const info = nsExamInfo();
    if (nsDraft.subjectId) {
      // 从后面步骤退回来改考试信息：更新原练习科目，不再建一个
      const updated = updateSubject(nsDraft.subjectId, info);
      if (!updated) return;
      nsDraft.name = updated.name;
      nsDraft.step = 2;
      nsRender();
      return;
    }
    const subject = createSubject(nsDraft.name, info);
    if (!subject) {
      document.getElementById('newSubjectName')?.focus();
      return;
    }
    nsDraft.subjectId = subject.id;
    nsDraft.name = subject.name;
    nsDraft.step = 2;
    toast(`已建好「${subject.name}」`, 'success');
    nsRender();
    return;
  }
  if (nsDraft.step === 2) {
    if (nsDraft.parsing) { toast('资料还在解析中，请稍候', 'info'); return; }
    nsDraft.step = 3;
    nsRender();
  }
}

function nsFinish(where) {
  const id = nsDraft.subjectId;
  const mats = subjectMaterials(id);
  nsReset();
  closeModal();
  if (!id) return;
  if (where === 'ai') openAIModal(id, mats.map((m) => m.id));
  else openSubject(id);
}

function pickNsFiles() {
  const input = document.getElementById('nsFileInput');
  if (!input) return;
  if (materialsUnavailable) {
    toast('当前浏览器无法保存资料，请更换浏览器或关闭无痕模式', 'error', 5000);
    return;
  }
  input.click();
}

function bindNsDropzone() {
  const dz = document.querySelector('#nsBody .ai-dropzone');
  if (!dz || dz.dataset.bound === '1') return;
  dz.dataset.bound = '1';
  let depth = 0;
  dz.addEventListener('dragenter', (e) => { e.preventDefault(); depth++; dz.classList.add('dragover'); });
  dz.addEventListener('dragover', (e) => e.preventDefault());
  dz.addEventListener('dragleave', (e) => { e.preventDefault(); depth = Math.max(0, depth - 1); if (!depth) dz.classList.remove('dragover'); });
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    depth = 0;
    dz.classList.remove('dragover');
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) nsUpload(files);
  });
}

async function handleNsFileInput(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  if (files.length) await nsUpload(files);
}

async function nsUpload(files) {
  if (!nsDraft.subjectId || nsDraft.parsing) return;
  if (materialsUnavailable) {
    toast('当前浏览器无法保存资料，请更换浏览器或关闭无痕模式', 'error', 5000);
    return;
  }
  const status = document.getElementById('nsUploadStatus');
  nsDraft.parsing = true;
  const existing = new Set(subjectMaterials(nsDraft.subjectId).map((m) => `${m.name}|${m.size}`));
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const label = file.name || `文件 ${i + 1}`;
    if (status) {
      status.hidden = false;
      status.textContent = `正在解析 ${i + 1}/${files.length}：${label}`;
    }
    if (file.size > MATERIAL_MAX_BYTES) {
      nsDraft.failed.push(`${label}：超过 30MB`);
      continue;
    }
    if (existing.has(`${file.name}|${file.size}`)) {
      nsDraft.failed.push(`${label}：已存在`);
      continue;
    }
    try {
      const { text, meta } = await extractMaterial(file);
      const clean = cleanMaterialText(text);
      const chars = aiVisibleChars(clean);
      if (chars < 50) throw new Error('几乎没有提取到文字，可能是扫描版');
      const ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
      const pageMatch = String(meta || '').match(/(\d+)/);
      const record = {
        id: 'mat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        subjectId: nsDraft.subjectId,
        name: String(file.name || '未命名资料').slice(0, 160),
        size: file.size,
        ext,
        kind: aiGuessFileKind(clean, file.name),
        pages: pageMatch ? parseInt(pageMatch[1], 10) : 0,
        chars,
        addedAt: Date.now(),
        text: clean
      };
      let saved = null;
      try {
        saved = await saveMaterialRecord(record, file.size <= MATERIAL_BLOB_LIMIT ? file : null);
      } catch {
        saved = await saveMaterialRecord({ ...record, hasBlob: false }, null);
      }
      materials.unshift(saved);
      existing.add(`${file.name}|${file.size}`);
      nsDraft.added += 1;
    } catch (e) {
      nsDraft.failed.push(`${label}：${(e && e.message) || '解析失败'}`);
    }
    materials.sort((a, b) => b.addedAt - a.addedAt);
    const sum = document.getElementById('nsSummary');
    if (sum) sum.innerHTML = nsSummaryBits();
  }
  nsDraft.parsing = false;
  if (nsDraft.step === 2) nsRender();
  const foot = document.getElementById('nsFooter');
  if (foot) foot.innerHTML = nsFooter();
  render();
}


// 练习科目页与卡组页脚的「编辑」：和新建向导第一步共用 examFieldsHtml / examFormValues，
// 一个弹窗同时改练习科目名称与考试信息（目标考试 / 考试日期 / 开始日期 / 备考目标 / 题量）
function examInfoModal(id) {
  const subject = userSubjects.find((s) => s.id === id);
  if (!subject) return;
  openModal(`
    <div class="modal-header">
      <div class="modal-title">编辑练习科目</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="wiz-layer">${examFieldsHtml({ ...subject, subjectKind: 'edit' })}</div>
      <p class="wiz-note">改名不会动已经存好的练习集和资料。</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="submitExamInfo('${id}')">保存</button>
    </div>`, 'modal-wide');
  setTimeout(() => document.getElementById('newSubjectName')?.focus(), 40);
}

function submitExamInfo(id) {
  const subject = userSubjects.find((s) => s.id === id);
  if (!subject) return;
  const v = examFormValues();
  if (!v.name) {
    toast('请填写练习科目', 'info');
    document.getElementById('newSubjectName')?.focus();
    return;
  }
  if (v.name !== subject.name && !renameSubject(id, v.name)) return;
  if (!updateSubject(id, v)) return;
  closeModal();
  toast('修改已保存', 'success');
  render();
}

function deleteSubject(id) {
  const subject = userSubjects.find((s) => s.id === id);
  if (!subject) return;
  const mats = subjectMaterials(id);
  const movable = subjectSets(id).filter((s) => !s.builtin);
  const detail = mats.length
    ? `会删除 ${mats.length} 份资料${movable.length ? `，${movable.length} 个练习集移到「未分类」` : ''}。`
    : (movable.length ? `${movable.length} 个练习集会移到「未分类」。` : '这个练习科目还没有内容。');
  confirmModal('删除练习科目', `确定删除「${subject.name}」吗？${detail}`, '删除练习科目', async () => {
    let failed = 0;
    for (const m of mats) {
      try { await deleteMaterialRecord(m.id); } catch { failed++; }
    }
    const nextSets = customSets.map((s) => (s.subjectId === id ? { ...s, subjectId: 'sub-inbox' } : s));
    const nextSubjects = userSubjects.filter((s) => s.id !== id);
    if (!saveJSON(STORAGE.sets, nextSets) || !saveJSON(STORAGE.subjects, nextSubjects)) {
      toast('删除失败：本地存储写入出错，请稍后重试', 'error', 5000);
      return;
    }
    customSets = nextSets;
    userSubjects = nextSubjects;
    materials = materials.filter((m) => m.subjectId !== id);
    if (failed) toast(`${failed} 份资料未能从资料库删除，刷新后可能仍会显示`, 'info', 5000);
    toast('练习科目已删除', 'success');
    if (state.subjectId === id) navigateTo('sets');
    else render();
  }, true);
}

const MATERIAL_MAX_BYTES = 30 * 1024 * 1024;
const MATERIAL_BLOB_LIMIT = 20 * 1024 * 1024;

function cleanMaterialText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickSubjectFiles() {
  const input = document.getElementById('subjectFileInput');
  if (!input) return;
  if (materialsUnavailable) {
    toast('当前浏览器无法保存资料，请更换浏览器或关闭无痕模式', 'error', 5000);
    return;
  }
  input.click();
}

async function handleSubjectFileInput(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  if (!files.length) return;
  await uploadSubjectFiles(state.subjectId, files);
}

async function uploadSubjectFiles(subjectId, files) {
  const subject = subjectById(subjectId);
  if (!subject) return;
  const status = document.getElementById('subjectUploadStatus');
  const body = $('.main-body');
  const scroll = body ? body.scrollTop : 0;
  const existing = new Set(subjectMaterials(subjectId).map((m) => `${m.name}|${m.size}`));
  let added = 0;
  let skipped = 0;
  const failed = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const label = file.name || `文件 ${i + 1}`;
    if (file.size > MATERIAL_MAX_BYTES) {
      failed.push(`${label}：超过 30MB`);
      continue;
    }
    const key = `${file.name}|${file.size}`;
    if (existing.has(key)) {
      skipped++;
      continue;
    }
    if (status) {
      status.hidden = false;
      status.textContent = `正在解析 ${i + 1}/${files.length}：${label}`;
    }
    try {
      const { text, meta } = await extractMaterial(file);
      const clean = cleanMaterialText(text);
      const chars = aiVisibleChars(clean);
      if (chars < 50) throw new Error('几乎没有提取到文字，可能是扫描版文件');
      const ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
      const pageMatch = String(meta || '').match(/(\d+)/);
      const record = {
        id: 'mat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        subjectId,
        name: String(file.name || '未命名资料').slice(0, 160),
        size: file.size,
        ext,
        kind: aiGuessFileKind(clean, file.name),
        pages: pageMatch ? parseInt(pageMatch[1], 10) : 0,
        chars,
        addedAt: Date.now(),
        text: clean
      };
      let saved = null;
      try {
        saved = await saveMaterialRecord(record, file.size <= MATERIAL_BLOB_LIMIT ? file : null);
      } catch (e) {
        // 原始文件写不下时退一步：只保留提取的文字
        saved = await saveMaterialRecord({ ...record, hasBlob: false }, null);
      }
      materials.unshift(saved);
      existing.add(key);
      added++;
    } catch (e) {
      failed.push(`${label}：${(e && e.message) || '解析失败'}`);
    }
  }

  materials.sort((a, b) => b.addedAt - a.addedAt);
  render();
  const restored = $('.main-body');
  if (restored) restored.scrollTop = scroll;

  const bits = [];
  if (added) bits.push(`已存入 ${added} 份资料`);
  if (skipped) bits.push(`跳过 ${skipped} 份重复文件`);
  if (failed.length) bits.push(`${failed.length} 份失败`);
  toast(bits.length ? bits.join('，') : '没有新增资料', added ? 'success' : 'info', 4500);
  if (failed.length) {
    setTimeout(() => failed.slice(0, 3).forEach((msg) => toast(msg, 'error', 5000)), 350);
  }
}

function previewMaterial(id) {
  const m = materials.find((x) => x.id === id);
  if (!m) return;
  openModal(`
    <div class="modal-header">
      <div class="modal-title" data-no-i18n>${esc(m.name)}</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="material-preview-meta">${materialKindLabel(m.kind)} · ${fmtSize(m.size)} · ${m.chars.toLocaleString('zh-CN')} 字 · ${fmtDate(m.addedAt)}${m.hasBlob ? '' : ' · 原始文件未保存'}</div>
      <pre class="material-preview">${esc(m.text)}</pre>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
      <button class="btn btn-primary" onclick="downloadMaterial('${m.id}')">${m.hasBlob ? '下载原文件' : '导出文字'}</button>
    </div>`, 'modal-wide');
}

async function downloadMaterial(id) {
  const m = materials.find((x) => x.id === id);
  if (!m) return;
  let blob = null;
  if (m.hasBlob) {
    try {
      blob = await readMaterialBlob(id);
    } catch (e) {
      console.warn('[StarQuiz] 原始文件读取失败，改为导出文字', e);
    }
  }
  let name = m.name;
  if (!blob) {
    blob = new Blob([m.text], { type: 'text/plain;charset=utf-8' });
    name = m.name.replace(/\.[^.]+$/, '') + '.txt';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function deleteMaterial(id) {
  const m = materials.find((x) => x.id === id);
  if (!m) return;
  confirmModal('删除资料', `确定删除「${m.name}」吗？提取的文字和原始文件都会删除。`, '删除', async () => {
    try {
      await deleteMaterialRecord(id);
    } catch (e) {
      toast('删除失败：资料库读取异常，请刷新后重试', 'error', 5000);
      return;
    }
    materials = materials.filter((x) => x.id !== id);
    toast('资料已删除', 'success');
    render();
  }, true);
}

function useMaterialInAI(id) {
  const m = materials.find((x) => x.id === id);
  if (!m) return;
  openAIModal(m.subjectId, [id]);
}

function moveSetModal(id) {
  const set = customSets.find((s) => s.id === id);
  if (!set) return;
  const current = subjectOfSet(set).id;
  const options = [...allSubjects(), INBOX_SUBJECT]
    .map((s) => `<option value="${s.id}" ${s.id === current ? 'selected' : ''} data-no-i18n>${esc(s.name)}</option>`)
    .join('');
  openModal(`
    <div class="modal-header">
      <div class="modal-title">移动练习集</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p class="text-sm text-muted" style="margin:0 0 12px">「${esc(set.name)}」当前在「${esc(subjectOfSet(set).name)}」。</p>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">目标练习科目</label>
        <select class="form-select" id="moveSetSubject">${options}</select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="moveSetConfirm('${id}')">移动</button>
    </div>`);
}

function moveSetConfirm(id) {
  const set = customSets.find((s) => s.id === id);
  const select = document.getElementById('moveSetSubject');
  if (!set || !select) return;
  const target = subjectById(select.value) ? select.value : 'sub-inbox';
  const prev = set.subjectId;
  if (target === 'sub-inbox') delete set.subjectId;
  else set.subjectId = target;
  if (!saveJSON(STORAGE.sets, customSets)) {
    if (prev) set.subjectId = prev;
    else delete set.subjectId;
    toast('移动失败：本地存储写入出错', 'error', 5000);
    return;
  }
  closeModal();
  toast(`已移动到「${(subjectById(target) || INBOX_SUBJECT).name}」`, 'success');
  render();
}

function renderSetDetail() {
  const set = getSet(state.setId);
  if (!set) return `<div class="empty-state"><div class="empty-state-title">练习集不存在</div><div class="empty-state-desc">它可能已被删除</div><button class="btn btn-primary" onclick="navigateTo('sets')">返回练习科目</button></div>`;

  const st = setStats(set.id);
  const kps = set.knowledgePoints || [];
  const types = {};
  set.questions.forEach((q) => { types[q.type] = (types[q.type] || 0) + 1; });
  const accent = setAccent(set);
  const subject = subjectOfSet(set);
  const path = (set.source && set.source.path) || null;
  const ctx = [];
  const examName = (path && path.exam) || subject.examName || '';
  if (examName) ctx.push(`目标考试：${esc(examName)}`);
  if (path && path.unit) ctx.push(`所属单元：${esc(path.unit)}`);
  const originLabel = path
    ? `备考规划考点「${esc(path.topic)}」`
    : (SET_ORIGIN_LABEL[set.origin] || (set.focusTopic ? `聚焦${esc(set.focusTopic)}` : (set.builtin ? '内置示例' : '手动添加')));
  ctx.push(`练习来源：${originLabel}`);

  return `
    <button class="back-link" onclick="openSubject('${subject.id}')">← 返回${esc(subject.name)}</button>

    <div class="set-detail-hero" style="--set-accent:${accent.bg};--set-accent-bar:${accent.bar}">
      <div class="detail-head">
        <div class="detail-icon" style="background:${accent.bg};color:${accent.fg}">${esc(set.icon || '题')}</div>
        <div>
          <div class="hero-eyebrow"><span data-no-i18n>${esc(subject.name)}</span> · 练习集</div>
          <h2 data-no-i18n>${esc(set.name)}</h2>
        </div>
      </div>
      <p>${esc(set.description || '')}</p>
      <div class="subject-meta">${ctx.map((c) => `<span class="ui-chip">${c}</span>`).join('')}</div>
      <div class="set-detail-stats">
        <div class="set-detail-stat"><div class="set-detail-stat-value">${set.questions.length}</div><div class="set-detail-stat-label">题目</div></div>
        <div class="set-detail-stat"><div class="set-detail-stat-value">${kps.length}</div><div class="set-detail-stat-label">知识点</div></div>
        <div class="set-detail-stat"><div class="set-detail-stat-value">${st.attempts}</div><div class="set-detail-stat-label">练习次数</div></div>
        <div class="set-detail-stat"><div class="set-detail-stat-value">${st.best == null ? '--' : st.best + '%'}</div><div class="set-detail-stat-label">最佳成绩</div></div>
      </div>
      <div class="set-detail-actions">
        <button class="btn btn-primary" onclick="startLearning('${set.id}')">${ICON.play} 进入学习模式</button>
        <button class="btn" onclick="startExamModal('${set.id}')">${ICON.clock} 模拟考试</button>
        ${set.builtin ? '' : `<button class="btn btn-secondary" onclick="moveSetModal('${set.id}')">更改练习科目</button>
        <button class="btn btn-danger" onclick="deleteSet('${set.id}')">删除练习集</button>`}
      </div>
      ${renderQuality(set)}
    </div>

    ${renderPlanReceiptCard(findPlanReceipt(set.id))}

    <div class="section-title">题型分布</div>
    <div class="tags mb-6">
      ${Object.entries(types).map(([t, n]) => `<span class="badge ${TYPE_CLASS[t] || 'badge-muted'}">${TYPE_LABEL[t] || t} × ${n}</span>`).join('')}
      ${(set.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
    </div>

    ${kps.length ? `
      <div class="section-title">知识点</div>
      <div class="knowledge-list">
        ${kps.map((kp) => `
          <div class="knowledge-item">
            <div class="knowledge-item-icon">${ICON.bulb}</div>
            <div>
              <div class="knowledge-item-title" data-no-i18n>${esc(kp.title)}</div>
              <div class="knowledge-item-desc" data-no-i18n>${esc(kp.content)}</div>
            </div>
          </div>`).join('')}
      </div>` : ''}

  `;
}

function deleteSet(id) {
  const set = getSet(id);
  if (!set || set.builtin) return;
  confirmModal('删除练习集', `确定删除「${set.name}」吗？该操作不可恢复，历史练习记录会保留。`, '删除', () => {
    const next = customSets.filter((s) => s.id !== id);
    if (!saveJSON(STORAGE.sets, next)) {
      toast('删除失败：本地存储写入出错，练习集仍然保留', 'error', 5000);
      return;
    }
    customSets = next;
    delete wrongBank.bySet[id];
    if (!saveJSON(STORAGE.wrong, wrongBank)) toast('错题本清理未能写入，下次打开可能恢复', 'info', 4000);
    if (resume.exam && resume.exam.setId === id) clearSession('exam');
    if (resume.learning && resume.learning.setId === id) clearSession('learning');
    toast('练习集已删除', 'success');
    navigateTo('sets');
  }, true);
}

function buildQuestionNav(cfg) {
  const learning = cfg.mode === 'learning';
  const legend = learning
    ? `<span><i class="qnav-dot current"></i>当前</span><span><i class="qnav-dot correct"></i>答对</span><span><i class="qnav-dot incorrect"></i>答错</span><span><i class="qnav-dot answered"></i>待提交</span><span><i class="qnav-dot"></i>未作答</span>`
    : `<span><i class="qnav-dot current"></i>当前</span><span><i class="qnav-dot answered"></i>已答</span><span><i class="qnav-dot"></i>未作答</span>`;

  return `
    <button type="button" class="qnav-toggle" id="qnavToggle" onclick="toggleQnav()" aria-controls="qnavPanel" aria-expanded="false">
      <span class="qnav-toggle-icon">${ICON.card}</span>
      <span>答题卡</span>
      <span class="qnav-toggle-count">${cfg.current + 1}/${cfg.total}</span>
    </button>
    <div class="qnav-scrim" id="qnavScrim" onclick="toggleQnav(false)"></div>
    <aside class="qnav-panel" id="qnavPanel" aria-label="答题卡" aria-hidden="true">
      <div class="qnav-head">
        <div>
          <div class="qnav-title">答题卡</div>
          <div class="qnav-sub">${learning ? '学习模式' : '考试模式'} · 已答 ${cfg.answeredCount} / ${cfg.total}</div>
        </div>
        <button type="button" class="qnav-close" onclick="toggleQnav(false)" aria-label="收起答题卡">×</button>
      </div>
      <div class="qnav-body">
        <div class="qnav-legend">${legend}</div>
        <div class="qnav-grid">${cfg.items}</div>
        <div class="qnav-actions">
          <button type="button" class="btn btn-secondary btn-sm" onclick="${cfg.prevAction}" ${cfg.current === 0 ? 'disabled' : ''}>← 上一题</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="${cfg.nextAction}" ${cfg.current === cfg.total - 1 ? 'disabled' : ''}>下一题 →</button>
        </div>
        <button type="button" class="btn ${cfg.finishClass} qnav-finish" onclick="${cfg.finishAction}">${cfg.finishLabel}</button>
      </div>
    </aside>`;
}

function syncQnav() {
  const panel = document.getElementById('qnavPanel');
  if (!panel) {
    state.qnavOpen = false;
    document.body.classList.remove('qnav-open');
    return;
  }
  const open = !!state.qnavOpen;
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  const scrim = document.getElementById('qnavScrim');
  if (scrim) scrim.classList.toggle('open', open);
  const toggle = document.getElementById('qnavToggle');
  if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('qnav-open', open);
}

function toggleQnav(force) {
  if (!document.getElementById('qnavPanel')) return;
  state.qnavOpen = typeof force === 'boolean' ? force : !state.qnavOpen;
  syncQnav();
}

function closeQnavAfterJump() {
  state.qnavOpen = false;
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const modal = document.getElementById('modalContainer');
  if (modal && modal.innerHTML.trim()) { closeModal(); return; }
  if (state.qnavOpen) toggleQnav(false);
});

/* —— 跨练习集的练习会话 ——
   题目 id 只在练习集内唯一（'q1' 这种），跨集会撞名，所以错题重练的作答键带上所属练习集：
   "setId::qid"。普通「学习」仍是裸 qid，两种键由同一个解析器处理，历史会话不受影响。
   成绩最后按所属练习集拆开写历史，每个练习集的进度、考点正确率、错题时间戳才都不会失真。 */
function wrongKey(setId, qid) {
  return `${strOf(setId, 80)}::${strOf(qid, 64)}`;
}

function parseSessionKey(l, key) {
  const s = strOf(key, 200);
  const i = s.indexOf('::');
  if (i < 0) return { setId: strOf(l && l.setId, 80), qid: s };
  return { setId: s.slice(0, i), qid: s.slice(i + 2) };
}

function learningQuestionAt(l, i) {
  if (!l) return null;
  return sessionQuestionAt(l.setId, arrOf(l.qids)[i]);
}

// 键可能是裸 qid（单一练习集）或 setId::qid（跨练习集重练），都归到同一个解析入口
function sessionQuestionAt(fallbackSetId, key) {
  const s = strOf(key, 200);
  if (!s) return null;
  const { setId, qid } = parseSessionKey({ setId: fallbackSetId }, s);
  return getQuestion(getSet(setId), qid);
}

// 一次作答落到哪个练习集的错题本上
function learningWrongTarget(l, key) {
  return parseSessionKey(l, key);
}

function recordAttemptsBySet(answers, meta) {
  const m = objOf(meta);
  const groups = new Map();
  arrOf(answers).forEach((a) => {
    if (!a || !a.qid) return;
    const setId = strOf(a.setId || m.setId, 80);
    if (!setId) return;
    if (!groups.has(setId)) groups.set(setId, []);
    groups.get(setId).push({
      qid: strOf(a.qid, 64),
      type: strOf(a.type, 20),
      userAnswer: a.userAnswer,
      correct: a.correct === true ? true : a.correct === false ? false : null
    });
  });
  const finishedAt = Number(m.finishedAt) || Date.now();
  const startedAt = Number(m.startedAt) || finishedAt;
  const out = [];
  groups.forEach((list, setId) => {
    const set = getSet(setId);
    const graded = list.filter((x) => x.correct !== null).length;
    const correct = list.filter((x) => x.correct === true).length;
    const total = Math.max(list.length, intOf(objOf(m.totals)[setId], list.length, 0, 1000));
    const planResult = planResultForAttempt(set, list);
    const attempt = {
      id: `a${finishedAt.toString(36)}${out.length.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      setId,
      setName: set ? set.name : strOf(m.setName, 80) || '（已删除的练习集）',
      mode: m.mode === 'exam' ? 'exam' : 'learning',
      startedAt,
      finishedAt,
      durationSec: intOf(m.durationSec, 0, 0, 86400),
      total,
      graded,
      correct,
      ungraded: Math.max(0, total - graded),
      score: graded ? Math.round((correct / graded) * 100) : 0,
      answers: list
    };
    if (planResult) attempt.planResult = planResult;
    out.push(attempt);
  });
  return out;
}

function pushAttempts(attempts) {
  if (!attempts.length) return false;
  history = [...attempts, ...history].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 200);
  // 只有单练习集的会话才谈「这次回传给哪个考点」；跨集模拟的归因留给各自的拆分记录
  if (attempts.length === 1 && attempts[0].planResult) {
    state.lastPlanAttempt = { id: attempts[0].id, setId: attempts[0].setId };
  }
  return saveJSON(STORAGE.history, history);
}

/* 错题重练：把任意来源的错题装进同一个会话。单一练习集时保持裸 qid 键，
   跨练习集才用复合键——这样普通学习的存档、断点恢复和统计完全不受影响。 */
// 进来的条目有两种：错题本里的（带 entry）和刚交卷那一轮答错的（只有题面），
// 这里只认「题目还在不在」，别让没有 entry 的正常来源被当成脏数据丢掉。
function startWrongPractice(items, title) {
  const list = arrOf(items).filter((i) => i && i.q && i.setId && i.qid);
  if (!list.length) { toast('这一组暂时没有可练的错题', 'info'); return; }
  const setIds = new Set(list.map((i) => i.setId));
  const mixed = setIds.size > 1;
  state.learning = {
    setId: list[0].setId,
    title: mixed ? strOf(title, 60) : '',
    qids: list.map((i) => (mixed ? wrongKey(i.setId, i.qid) : i.qid)),
    index: 0,
    answers: {},
    results: {},
    cache: {},
    seenKP: {},
    startedAt: Date.now(),
    finished: false,
    onlyWrong: true
  };
  resume.learning = null;
  state.view = 'learning';
  state.setId = list[0].setId;
  closeSidebar();
  persistLearning();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function startLearning(setId, onlyWrong = false) {
  const set = getSet(setId);
  if (!set) return;
  if (onlyWrong) {
    const items = wrongOpenItems(setId).sort(wrongPriorityCompare);
    if (items.length) { startWrongPractice(items, set.name); return; }
    toast('这个练习集暂无错题，已切换为全部题目', 'info');
  }
  const list = set.questions;
  state.learning = {
    setId,
    title: '',
    qids: list.map((q) => q.id),
    index: 0,
    answers: {},
    results: {},
    cache: {},
    seenKP: {},
    startedAt: Date.now(),
    finished: false,
    onlyWrong
  };
  resume.learning = null;
  state.view = 'learning';
  state.setId = setId;
  closeSidebar();
  persistLearning();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function currentLearningQuestion() {
  const l = state.learning;
  if (!l) return null;
  return learningQuestionAt(l, l.index);
}

function renderLearning() {
  const l = state.learning;
  if (!l) return `<div class="empty-state"><div class="empty-state-title">未开始学习</div><button class="btn btn-primary" onclick="navigateTo('sets')">返回练习科目</button></div>`;
  const set = getSet(l.setId);

  // 作答状态一律按「会话键」存取：单一练习集时键就是 qid，跨练习集重练时是 setId::qid
  const key = strOf(l.qids[l.index], 200);
  const q = currentLearningQuestion();
  if (!q) return `<div class="empty-state"><div class="empty-state-title">没有题目</div><button class="btn btn-primary" onclick="${l.onlyWrong ? "navigateTo('wrong')" : "navigateTo('sets')"}">返回</button></div>`;
  const owner = getSet(parseSessionKey(l, key).setId) || set;

  const total = l.qids.length;
  const res = l.results[key];
  const answered = !!res;
  const kp = (owner && owner.knowledgePoints || []).find((k) => k.id === q.knowledgePointId);
  const isLast = l.index === total - 1;
  // 跨练习集重练时，每题标出它来自哪个练习集，避免「同名题」看错
  const mixedSets = new Set(l.qids.map((k) => parseSessionKey(l, k).setId)).size > 1;

  const navItems = l.qids.map((k, i) => {
    const qq = sessionQuestionAt(l.setId, k);
    if (!qq) return '';
    const r = l.results[k];
    const pending = !r && isAnswered(qq, l.answers[k]);
    let cls = '';
    let stateText = '未作答';
    if (i === l.index) { cls = 'current'; stateText = '当前'; }
    else if (r) { cls = r.correct ? 'correct' : 'incorrect'; stateText = r.correct ? '答对' : '答错'; }
    else if (pending) { cls = 'answered'; stateText = '待提交'; }
    return `<button type="button" class="q-nav-item ${cls}" onclick="learningGo(${i})" title="第 ${i + 1} 题 · ${TYPE_LABEL[qq.type] || qq.type} · ${stateText}" aria-label="第 ${i + 1} 题，${stateText}">${i + 1}</button>`;
  }).join('');
  const answeredCount = l.qids.filter((k) => {
    if (l.results[k]) return true;
    const qq = sessionQuestionAt(l.setId, k);
    return !!qq && isAnswered(qq, l.answers[k]);
  }).length;

  let bodyHtml = '';
  if (answered) {
    bodyHtml = renderAnsweredQuestion(q, res, 'learning');
  } else {
    bodyHtml = renderAnswerableQuestion(q, l, 'learning', key);
  }

  const fromWrong = !!l.onlyWrong;

  return `
    <div class="question-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <button class="back-link" style="margin:0" onclick="${fromWrong ? 'backToWrong()' : `backToSet('${l.setId}')`}">← ${esc(fromWrong ? (l.title || '错题本') : ((set || {}).name || '练习科目'))}</button>
        <button class="btn btn-secondary btn-sm" onclick="finishLearning(false)">完成学习</button>
      </div>

      <div class="learning-progress-bar">
        <div class="progress-bar"><div class="progress-fill" style="width:${((l.index + 1) / total) * 100}%"></div></div>
        <span class="learning-progress-text">${l.index + 1} / ${total}</span>
      </div>

      ${kp ? `
        <div class="knowledge-card">
          <div class="knowledge-card-title">${ICON.bulb} 知识点 · <span data-no-i18n>${esc(kp.title)}</span></div>
          <div class="knowledge-card-content" data-no-i18n>${esc(kp.content)}</div>
        </div>` : ''}

      <div class="question-header">
        <span class="question-number">第 ${l.index + 1} 题 · 共 ${total} 题${mixedSets && owner ? ` · <span data-no-i18n>${esc(owner.name)}</span>` : ''}</span>
        <span style="display:flex;gap:8px;align-items:center">
          <span class="badge ${TYPE_CLASS[q.type] || 'badge-muted'}">${TYPE_LABEL[q.type] || q.type}</span>
          ${difficultyDots(q.difficulty)}
        </span>
      </div>

      <div class="question-text" data-no-i18n>${esc(q.content)}</div>

      ${bodyHtml}

      <div class="nav-buttons">
        <button class="btn btn-secondary" ${l.index === 0 ? 'disabled' : ''} onclick="learningPrev()">← 上一题</button>
        ${isLast
          ? `<button class="btn btn-success" onclick="finishLearning(false)">完成学习</button>`
          : `<button class="btn btn-primary" onclick="learningNext()">下一题 →</button>`}
      </div>

      ${buildQuestionNav({
        mode: 'learning',
        current: l.index,
        total,
        answeredCount,
        items: navItems,
        prevAction: 'learningPrev()',
        nextAction: 'learningNext()',
        finishLabel: '完成学习',
        finishAction: 'finishLearning(false)',
        finishClass: 'btn-success'
      })}
    </div>`;
}

function renderAnswerableQuestion(q, l, mode, key) {
  const k = strOf(key, 200) || strOf(q.id, 64);
  if (q.type === 'code') return renderCodeQuestion(q, l, mode, k);

  let html = '';
  if (q.type === 'single' || q.type === 'tf') {
    const opts = q.type === 'tf' ? ['正确', '错误'] : q.options;
    html += `<div class="options-list">${opts.map((o, idx) => `
      <div class="option-item" onclick="learningChoose('${k}', ${idx})">
        <span class="option-marker">${String.fromCharCode(65 + idx)}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`).join('')}</div>`;
  } else if (q.type === 'multi') {
    const sel = l.answers[k] || [];
    html += `<div class="options-list">${q.options.map((o, idx) => `
      <div class="option-item ${sel.includes(idx) ? 'selected' : ''}" onclick="learningToggleMulti('${k}', ${idx})">
        <span class="option-marker checkbox">${sel.includes(idx) ? '✓' : ''}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`).join('')}</div>
      <button class="btn btn-primary" onclick="learningSubmitMulti('${k}')" ${sel.length === 0 ? 'disabled' : ''}>提交答案</button>`;
  } else if (q.type === 'fill') {
    html += `<input class="fill-input" id="fillInput" placeholder="输入你的答案..." value="${esc(l.answers[k] || '')}" oninput="learningInput('${k}', this.value)">
      <div><button class="btn btn-primary" onclick="learningSubmitFill('${k}')">提交答案</button></div>`;
  }
  return html;
}

function renderAnsweredQuestion(q, res, mode) {
  const correct = res.correct;
  const feedbackClass = correct ? 'feedback-correct' : 'feedback-incorrect';

  let optionsHtml = '';
  if (q.type === 'single' || q.type === 'tf') {
    const opts = q.type === 'tf' ? ['正确', '错误'] : q.options;
    const correctIdx = q.type === 'tf' ? (q.answer ? 0 : 1) : q.answer;
    const userIdx = q.type === 'tf' ? (res.answer ? 0 : 1) : res.answer;
    optionsHtml = `<div class="options-list">${opts.map((o, idx) => {
      let cls = '';
      if (idx === correctIdx) cls = 'show-correct';
      else if (idx === userIdx) cls = 'incorrect';
      return `<div class="option-item ${cls}">
        <span class="option-marker">${String.fromCharCode(65 + idx)}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`;
    }).join('')}</div>`;
  } else if (q.type === 'multi') {
    const correctArr = Array.isArray(q.answer) ? q.answer : [];
    const userArr = Array.isArray(res.answer) ? res.answer : [];
    optionsHtml = `<div class="options-list">${q.options.map((o, idx) => {
      const isCorrect = correctArr.includes(idx);
      const isUser = userArr.includes(idx);
      let cls = '';
      if (isCorrect) cls = 'show-correct';
      else if (isUser) cls = 'incorrect';
      return `<div class="option-item ${cls}">
        <span class="option-marker checkbox">${isCorrect ? '✓' : (isUser ? '✗' : '')}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`;
    }).join('')}</div>`;
  } else if (q.type === 'fill') {
    optionsHtml = `
      <div class="answer-compare">
        <div><span class="answer-compare-label">你的答案</span><b style="color:${correct ? 'var(--success)' : 'var(--danger)'}" data-no-i18n>${esc(res.answer || t('（空）'))}</b></div>
        <div><span class="answer-compare-label">正确答案</span><b style="color:var(--success)" data-no-i18n>${esc(answerText(q))}</b></div>
      </div>`;
  } else if (q.type === 'code') {
    optionsHtml = renderCodeResult(q, res);
  }

  return `${optionsHtml}
    <div class="feedback ${feedbackClass}">
      <div class="feedback-title">${correct ? '✓ 回答正确' : '✕ 回答错误'}</div>
      ${q.explanation ? `<div class="feedback-explanation" data-no-i18n>${esc(q.explanation)}</div>` : ''}
    </div>`;
}

function renderCodeResult(q, res) {
  let html = '';
  if (res.correct) {
    html += `<div class="code-output success"><div class="output-label pass">✓ 所有测试用例通过</div></div>`;
  }
  if (res.output) {
    html += `<div class="code-output ${res.correct ? 'success' : 'error'}"><div class="output-label ${res.correct ? 'pass' : 'fail'}">${res.correct ? '运行结果' : '测试结果'}</div>${esc(res.output)}</div>`;
  }
  if (res.revealed && q.answer) {
    html += `<div class="code-output" style="margin-bottom:16px"><div class="output-label">参考答案</div><span data-no-i18n>${esc(q.answer)}</span></div>`;
  }
  return html;
}

function answerText(q) {
  if (q.type === 'tf') return q.answer ? '正确' : '错误';
  if (q.type === 'fill') {
    const arr = Array.isArray(q.answer) ? q.answer : [q.answer];
    return arr.join(' / ');
  }
  if (q.type === 'single') return `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer] ?? ''}`;
  if (q.type === 'multi') {
    const arr = Array.isArray(q.answer) ? q.answer : [];
    return arr.map((i) => `${String.fromCharCode(65 + i)}`).join(', ');
  }
  if (q.type === 'code') return '见参考答案';
  return '';
}

function userAnswerText(q, ans) {
  // 这些是界面兜底文案，不是用户作答内容：容器带 data-no-i18n 不参与翻译层，所以在这里按当前语言取值
  if (ans == null || (Array.isArray(ans) && ans.length === 0) || ans === '') return t('（未作答）');
  if (q.type === 'tf') return ans ? t('正确') : t('错误');
  if (q.type === 'single') return `${String.fromCharCode(65 + ans)}. ${q.options[ans] ?? ''}`;
  if (q.type === 'multi' && Array.isArray(ans)) return ans.map((i) => String.fromCharCode(65 + i)).join(', ');
  if (q.type === 'fill') return String(ans);
  if (q.type === 'code') return t('（代码见作答）');
  return String(ans);
}

function learningChoose(key, idx) {
  const l = state.learning;
  if (!l || l.results[key]) return;
  const q = sessionQuestionAt(l.setId, key);
  if (!q) return;
  let answer = idx;
  if (q.type === 'tf') answer = idx === 0;
  l.answers[key] = answer;
  const correct = gradeObjective(q, answer);
  l.results[key] = { correct, answer };
  gradeWrong(l, key, correct);
  persistLearning();
  render();
}

function learningToggleMulti(key, idx) {
  const l = state.learning;
  if (!l || l.results[key]) return;
  let sel = l.answers[key] || [];
  if (sel.includes(idx)) sel = sel.filter((i) => i !== idx);
  else sel = [...sel, idx].sort((a, b) => a - b);
  l.answers[key] = sel;
  persistLearning();
  render();
}

function learningSubmitMulti(key) {
  const l = state.learning;
  if (!l || l.results[key]) return;
  const sel = l.answers[key] || [];
  if (!sel.length) return;
  const q = sessionQuestionAt(l.setId, key);
  if (!q) return;
  const correct = sameSet(sel, q.answer);
  l.results[key] = { correct, answer: sel };
  gradeWrong(l, key, correct);
  persistLearning();
  render();
}

function learningInput(key, val) {
  if (!state.learning) return;
  state.learning.answers[key] = val;
  persistLearningSoon();
}

function learningSubmitFill(key) {
  const l = state.learning;
  if (!l || l.results[key]) return;
  const q = sessionQuestionAt(l.setId, key);
  if (!q) return;
  const val = l.answers[key] || '';
  if (!val.trim()) { toast('请先输入答案', 'info'); return; }
  const correct = gradeObjective(q, val);
  l.results[key] = { correct, answer: val };
  gradeWrong(l, key, correct);
  persistLearning();
  render();
}

// 一次作答落到它所属练习集的错题本上
function gradeWrong(l, key, correct) {
  const target = learningWrongTarget(l, key);
  updateWrongBank(target.setId, target.qid, correct, { attemptId: learningAttemptId(l) });
}

function backToSet(setId) {
  if (state.view === 'learning' && state.learning) finishLearning(true);
  state.view = 'setDetail';
  state.setId = setId;
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function backToWrong() {
  if (state.view === 'learning' && state.learning) finishLearning(true);
  navigateTo('wrong');
}

function learningNext() {
  const l = state.learning;
  if (!l) return;
  if (l.index < l.qids.length - 1) learningGo(l.index + 1);
}

function learningPrev() {
  const l = state.learning;
  if (!l) return;
  if (l.index > 0) learningGo(l.index - 1);
}

function learningGo(i) {
  const l = state.learning;
  if (!l) return;
  if (i < 0 || i >= l.qids.length) return;
  l.index = i;
  closeQnavAfterJump();
  persistLearning();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function finishLearning(silent) {
  const l = state.learning;
  if (!l || l.finished) { if (!silent) navigateTo(l && l.onlyWrong ? 'wrong' : 'sets'); return; }
  l.finished = true;

  const answeredKeys = Object.keys(l.results);
  if (answeredKeys.length === 0) {
    state.learning = null;
    clearSession('learning');
    if (!silent) {
      if (l.onlyWrong) { navigateTo('wrong'); return; }
      state.setId = l.setId;
      state.view = 'setDetail';
      render();
    }
    return;
  }

  // 每一答都带上所属练习集：跨集重练的成绩按集拆开写历史，统计和考点归因才不会串味
  const answers = answeredKeys.map((key) => {
    const target = parseSessionKey(l, key);
    const res = l.results[key] || {};
    return {
      setId: target.setId,
      qid: target.qid,
      type: (sessionQuestionAt(l.setId, key) || {}).type,
      userAnswer: res.answer,
      correct: res.correct === true ? true : res.correct === false ? false : null
    };
  });
  const totals = {};
  arrOf(l.qids).forEach((key) => {
    const setId = parseSessionKey(l, key).setId;
    if (setId) totals[setId] = (totals[setId] || 0) + 1;
  });

  const finishedAt = Date.now();
  const startedAt = Number(l.startedAt) || finishedAt;
  const correct = answers.filter((a) => a.correct === true).length;
  const attempts = recordAttemptsBySet(answers, {
    mode: 'learning',
    setId: l.setId,
    setName: (getSet(l.setId) || {}).name,
    startedAt,
    finishedAt,
    durationSec: Math.round((finishedAt - startedAt) / 1000),
    totals
  });
  pushAttempts(attempts);
  clearSession('learning');

  state.learning = null;
  if (!silent) {
    const score = answers.length ? Math.round((correct / answers.length) * 100) : 0;
    toast(`学习完成：答对 ${correct}/${answers.length}，正确率 ${score}%`, correct === answers.length ? 'success' : 'info');
    if (l.onlyWrong) { navigateTo('wrong'); return; }
    state.setId = l.setId;
    state.view = 'setDetail';
    render();
  }
}

function renderCodeQuestion(q, l, mode, key) {
  const k = strOf(key, 200) || strOf(q.id, 64);
  const value = l.cache[k] ?? (l.answers[k] || q.template || '');
  const lang = q.language || 'javascript';
  const tests = (q.testCases || []).slice(0, 4);

  return `
    <div class="code-editor-wrapper">
      <div class="code-editor-toolbar">
        <label>${LANG_LABEL[lang] || lang}</label>
        <button class="btn btn-sm" onclick="learningRunCode('${k}')" id="runCodeBtn">运行测试</button>
      </div>
      <textarea class="code-editor" id="codeEditor" spellcheck="false" oninput="learningCodeInput('${k}', this.value)">${esc(value)}</textarea>
      ${tests.length ? `
        <div class="test-cases">
          <div class="test-cases-title">测试用例</div>
          ${tests.map((t, i) => `
            <div class="test-case-item">
              <div><div class="label">输入</div><code>${esc(t.input)}</code></div>
              <div><div class="label">期望输出</div><code>${esc(t.expectedOutput)}</code></div>
            </div>`).join('')}
        </div>` : ''}
    </div>
    <div id="codeOutputArea"></div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <button class="btn btn-secondary btn-sm" onclick="learningRevealAnswer('${k}')">查看参考答案</button>
    </div>`;
}

function learningCodeInput(key, val) {
  if (!state.learning) return;
  state.learning.cache[key] = val;
  state.learning.answers[key] = val;
  persistLearningSoon();
}

async function learningRunCode(key) {
  const l = state.learning;
  if (!l) return;
  const q = sessionQuestionAt(l.setId, key);
  if (!q) return;
  const source = l.cache[key] ?? l.answers[key] ?? q.template ?? '';
  const tests = (q.testCases || []).slice(0, 4);
  if (!tests.length) {
    toast('这道题没有测试用例，暂不能自动判题', 'info');
    return;
  }
  const btn = document.getElementById('runCodeBtn');
  const out = document.getElementById('codeOutputArea');
  if (btn) { btn.disabled = true; btn.textContent = '运行中...'; }
  if (out) out.innerHTML = `<div class="code-output running"><div class="output-label run">正在运行测试用例...</div></div>`;

  try {
    const lines = [];
    let allPass = true;
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      const result = await judgeRun(q.language || 'javascript', source + '\n' + t.input, '');
      const stdout = (result.stdout || '').trim();
      const expected = String(t.expectedOutput).trim();
      const pass = stdout === expected;
      if (!pass) allPass = false;
      lines.push(`用例 ${i + 1}: ${pass ? '✓ 通过' : '✗ 未通过'}${pass ? '' : `\n  期望: ${expected}\n  实际: ${stdout || '（空）'}`}${result.stderr ? `\n  错误: ${result.stderr.split('\n')[0]}` : ''}`);
      if (result.compileOutput) {
        lines.push(`  编译输出: ${result.compileOutput.split('\n')[0]}`);
      }
    }
    if (out) {
      out.innerHTML = `<div class="code-output ${allPass ? 'success' : 'error'}">
        <div class="output-label ${allPass ? 'pass' : 'fail'}">${allPass ? '✓ 全部通过' : '✗ 部分用例未通过'}</div>${esc(lines.join('\n\n'))}</div>`;
    }
    if (allPass && !l.results[key]) {
      l.results[key] = { correct: true, answer: source, output: lines.join('\n'), revealed: false };
      gradeWrong(l, key, true);
      persistLearning();
      toast('全部测试通过，回答正确！', 'success');
      render();
      const body = $('.main-body');
      if (body) body.scrollTop = 0;
    }
  } catch (e) {
    if (out) {
      out.innerHTML = `<div class="code-output error"><div class="output-label fail">判题服务不可用</div>${esc(e.message || '请检查网络或稍后重试')}</div>`;
    }
  } finally {
    const b = document.getElementById('runCodeBtn');
    if (b) { b.disabled = false; b.textContent = '运行测试'; }
  }
}

function learningRevealAnswer(key) {
  const l = state.learning;
  if (!l) return;
  const q = sessionQuestionAt(l.setId, key);
  if (!q) return;
  if (!l.results[key]) {
    l.results[key] = { correct: false, answer: l.cache[key] || '', revealed: true };
    gradeWrong(l, key, false);
  } else {
    l.results[key].revealed = true;
  }
  persistLearning();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function startExamModal(setId) {
  const set = getSet(setId);
  if (!set) return;
  const n = arrOf(set.questions).length;
  if (!n) { toast('这个练习集还没有题目，先添加题目再考试', 'info'); return; }
  const countOptions = [`<option value="all">全部（${n} 题）</option>`];
  if (n > 10) countOptions.push('<option value="10">随机 10 题</option>');
  if (n > 20) countOptions.push('<option value="20">随机 20 题</option>');
  const defMin = Math.min(60, Math.max(10, n * 2));

  openModal(`
    <div class="modal-header">
      <div class="modal-title">模拟考试 · <span data-no-i18n>${esc(set.name)}</span></div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">考试时长</label>
        <select class="form-select" id="examMinutes">
          ${[10, 20, 30, 45, 60].map((m) => `<option value="${m}" ${m === defMin ? 'selected' : ''}>${m} 分钟</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">题目范围</label>
        <select class="form-select" id="examCount">${countOptions.join('')}</select>
      </div>
      <p class="text-sm text-muted">考试模式下答完交卷才会显示结果，编程题交卷时自动运行测试用例评分。</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="beginExam('${set.id}')">开始考试</button>
    </div>`);
}

function beginExam(setId) {
  const set = getSet(setId);
  if (!set) return;
  if (!arrOf(set.questions).length) { closeModal(); toast('这个练习集还没有题目', 'info'); return; }
  const minutesEl = document.getElementById('examMinutes');
  const countEl = document.getElementById('examCount');
  const minutes = Math.min(600, Math.max(1, parseInt(minutesEl && minutesEl.value, 10) || 30));
  const countVal = countEl && countEl.value;
  let qs = shuffle(set.questions);
  if (countVal !== 'all') {
    const limit = parseInt(countVal, 10);
    qs = Number.isFinite(limit) && limit > 0 ? qs.slice(0, limit) : qs;
  }

  closeModal();
  resume.exam = null;
  state.exam = {
    setId,
    name: set.name,
    questions: qs,
    answers: new Array(qs.length).fill(null),
    current: 0,
    startedAt: Date.now(),
    deadline: Date.now() + minutes * 60000,
    minutes,
    grading: false,
    timerId: null
  };
  state.view = 'exam';
  state.setId = setId;
  persistExam();
  render();
}

/* —— 错题模拟：把错题装进一场闭卷考试，可以按比例混入没练过的题 —— */

function examOwnerAt(ex, i) {
  const owner = arrOf(ex && ex.owners)[i];
  return strOf(owner || (ex && ex.setId), 80);
}

// 同一次考试的错题只记一次：断点恢复或重复交卷都不会把「错 N 次」刷高
function examAttemptId(ex) {
  return `E${(Number(ex && ex.startedAt) || 0).toString(36)}`;
}

const WRONG_MOCK_SCOPES = ['due', 'open', 'stubborn'];

function wrongMockItems(scope) {
  const open = wrongOpenItems();
  if (scope === 'stubborn') return open.filter((i) => isStubbornWrong(i.entry)).sort(wrongPriorityCompare);
  if (scope === 'due') {
    const due = open.filter((i) => wrongIsDue(i.entry)).sort(wrongPriorityCompare);
    // 一道都没到期时别空转：最近错的题顶上，用户仍然有东西可练
    return due.length ? due : open.slice().sort(wrongPriorityCompare).slice(0, 10);
  }
  return open.sort(wrongPriorityCompare);
}

function wrongMockScopeLabel(scope) {
  if (scope === 'stubborn') return '顽固错题';
  if (scope === 'open') return '全部未掌握';
  return '今日到期';
}

// 混入的新题只从错题所在练习科目里抽，且排除错题本有记录和练习历史里答过的题
function freshQuestionsFor(items, limit) {
  if (!limit) return [];
  const subjectIds = new Set(items.map((i) => subjectOfSet(i.set).id));
  const taken = new Set(items.map((i) => wrongKey(i.setId, i.qid)));
  const answered = new Set();
  history.forEach((a) => {
    arrOf(a.answers).forEach((x) => { if (x && x.qid) answered.add(`${strOf(a.setId, 80)}::${x.qid}`); });
  });
  const pool = [];
  allSets().forEach((set) => {
    if (!subjectIds.has(subjectOfSet(set).id)) return;
    arrOf(set.questions).forEach((q) => {
      const key = wrongKey(set.id, q.id);
      if (taken.has(key) || answered.has(key)) return;
      pool.push({ setId: set.id, qid: q.id, q, key });
    });
  });
  return shuffle(pool).slice(0, Math.max(0, Math.min(limit, 40)));
}

function wrongMockPlan(scope, mixRatio) {
  const items = wrongMockItems(scope);
  if (!items.length) return { items: [], refs: [], total: 0 };
  const mix = mixRatio > 0 ? Math.max(1, Math.round(items.length * mixRatio)) : 0;
  const fresh = freshQuestionsFor(items, mix);
  const refs = shuffle([...items.map((i) => ({ setId: i.setId, qid: i.qid, q: i.q })), ...fresh]);
  return { items, fresh, refs, total: refs.length };
}

function startWrongMockModal() {
  const open = wrongOpenItems().length;
  if (!open) { toast('错题本还是空的，先去做几套题', 'info'); return; }
  const counts = WRONG_MOCK_SCOPES.map((scope) => ({ scope, n: wrongMockItems(scope).length })).filter((c) => c.n);
  const paper = wrongMockPlan((counts[0] || {}).scope || 'due', 0.2);
  const defMin = Math.min(60, Math.max(10, paper.total * 2));
  openModal(`
    <div class="modal-header">
      <div class="modal-title">错题模拟</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">出题范围</label>
        <select class="form-select" id="mockScope" onchange="updateWrongMockPreview()">
          ${counts.map((c) => `<option value="${c.scope}">${wrongMockScopeLabel(c.scope)}（${c.n} 题）</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">混入新题</label>
        <select class="form-select" id="mockMix" onchange="updateWrongMockPreview()">
          <option value="0">不混 · 只考错题</option>
          <option value="0.2" selected>混约 20% 没练过的题</option>
          <option value="0.5">混约一半新题</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">考试时长</label>
        <select class="form-select" id="mockMinutes">
          ${[10, 20, 30, 45, 60].map((m) => `<option value="${m}" ${m === defMin ? 'selected' : ''}>${m} 分钟</option>`).join('')}
        </select>
      </div>
      <p class="text-sm text-muted" id="mockPreview">${esc(wrongMockSummary(paper))}</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="beginWrongMock()">开始考试</button>
    </div>`);
}

function wrongMockSummary(paper) {
  if (!paper.total) return '这个范围里暂时没有错题';
  const sets = new Set(paper.refs.map((r) => r.setId)).size;
  return `本次 ${paper.total} 题：错题 ${paper.items.length} 道 · 新题 ${paper.fresh.length} 道 · 跨 ${sets} 个练习集，交卷后统一评分。`;
}

function updateWrongMockPreview() {
  const el = document.getElementById('mockPreview');
  if (!el) return;
  const scopeEl = document.getElementById('mockScope');
  const mixEl = document.getElementById('mockMix');
  const scope = WRONG_MOCK_SCOPES.includes(scopeEl && scopeEl.value) ? scopeEl.value : 'due';
  const ratio = Math.min(1, Math.max(0, parseFloat(mixEl && mixEl.value) || 0));
  el.textContent = wrongMockSummary(wrongMockPlan(scope, ratio));
}

function beginWrongMock() {
  const scopeEl = document.getElementById('mockScope');
  const mixEl = document.getElementById('mockMix');
  const minutesEl = document.getElementById('mockMinutes');
  const scope = WRONG_MOCK_SCOPES.includes(scopeEl && scopeEl.value) ? scopeEl.value : 'due';
  const ratio = Math.min(1, Math.max(0, parseFloat(mixEl && mixEl.value) || 0));
  const minutes = Math.min(600, Math.max(1, parseInt(minutesEl && minutesEl.value, 10) || 30));
  const paper = wrongMockPlan(scope, ratio);
  if (!paper.total) { closeModal(); toast('这个范围里暂时没有错题', 'info'); return; }

  closeModal();
  resume.exam = null;
  resume.learning = null;
  const first = paper.refs[0];
  state.exam = {
    setId: first.setId,
    name: `错题模拟 · ${wrongMockScopeLabel(scope)}`,
    owners: paper.refs.map((r) => r.setId),
    mock: true,
    questions: paper.refs.map((r) => r.q),
    answers: new Array(paper.total).fill(null),
    current: 0,
    startedAt: Date.now(),
    deadline: Date.now() + minutes * 60000,
    minutes,
    grading: false,
    timerId: null
  };
  state.view = 'exam';
  state.setId = first.setId;
  persistExam();
  render();
}

function renderExam() {
  const ex = state.exam;
  if (!ex) return `<div class="empty-state"><div class="empty-state-title">没有进行中的考试</div><button class="btn btn-primary" onclick="navigateTo('sets')">返回练习科目</button></div>`;
  const set = getSet(ex.setId);
  const examName = ex.owners ? (ex.name || '错题模拟') : (set ? set.name : (ex.name || '考试'));

  const q = ex.questions[ex.current];
  if (!q) {
    return `<div class="empty-state">
      <div class="empty-state-title">这场考试没有可答的题目</div>
      <div class="empty-state-desc">可能是练习集被删除或数据异常，答题记录不受影响。</div>
      <button class="btn btn-primary" onclick="abandonExam()">结束考试</button>
    </div>`;
  }
  const total = ex.questions.length;
  const answeredCount = ex.answers.filter((a, i) => isAnswered(ex.questions[i], a)).length;

  const navItems = ex.questions.map((qq, i) => {
    const done = isAnswered(qq, ex.answers[i]);
    let cls = '';
    let stateText = '未作答';
    if (i === ex.current) { cls = 'current'; stateText = '当前'; }
    else if (done) { cls = 'answered'; stateText = '已答'; }
    return `<button type="button" class="q-nav-item ${cls}" onclick="examGo(${i})" title="第 ${i + 1} 题 · ${TYPE_LABEL[qq.type] || qq.type} · ${stateText}" aria-label="第 ${i + 1} 题，${stateText}">${i + 1}</button>`;
  }).join('');

  let bodyHtml = '';
  if (q.type === 'code') {
    bodyHtml = `
      <div class="code-editor-wrapper">
        <div class="code-editor-toolbar">
          <label>${LANG_LABEL[q.language || 'javascript'] || q.language}</label>
          <span style="font-size:12px">交卷后自动运行测试用例评分</span>
        </div>
        <textarea class="code-editor" id="codeEditor" spellcheck="false" oninput="examCodeInput(${ex.current}, this.value)">${esc(ex.answers[ex.current] || q.template || '')}</textarea>
        ${(q.testCases || []).length ? `
          <div class="test-cases">
            <div class="test-cases-title">测试用例</div>
            ${(q.testCases || []).slice(0, 4).map((t) => `
              <div class="test-case-item">
                <div><div class="label">输入</div><code>${esc(t.input)}</code></div>
                <div><div class="label">期望输出</div><code>${esc(t.expectedOutput)}</code></div>
              </div>`).join('')}
          </div>` : ''}
      </div>`;
  } else if (q.type === 'single' || q.type === 'tf') {
    const opts = q.type === 'tf' ? ['正确', '错误'] : q.options;
    const cur = ex.answers[ex.current];
    bodyHtml = `<div class="options-list">${opts.map((o, idx) => {
      let selected = false;
      if (q.type === 'tf') selected = cur === (idx === 0);
      else selected = cur === idx;
      return `<div class="option-item ${selected ? 'selected' : ''}" onclick="examChoose(${idx})">
        <span class="option-marker">${String.fromCharCode(65 + idx)}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`;
    }).join('')}</div>`;
  } else if (q.type === 'multi') {
    const cur = Array.isArray(ex.answers[ex.current]) ? ex.answers[ex.current] : [];
    bodyHtml = `<div class="options-list">${q.options.map((o, idx) => `
      <div class="option-item ${cur.includes(idx) ? 'selected' : ''}" onclick="examToggleMulti(${idx})">
        <span class="option-marker checkbox">${cur.includes(idx) ? '✓' : ''}</span>
        <span class="option-content" data-no-i18n>${esc(o)}</span>
      </div>`).join('')}</div>`;
  } else if (q.type === 'fill') {
    bodyHtml = `<input class="fill-input" id="fillInput" placeholder="输入你的答案..." value="${esc(ex.answers[ex.current] || '')}" oninput="examFillInput(${ex.current}, this.value)">`;
  }

  return `
    <div class="question-container">
      <div class="exam-header">
        <div>
          <div style="font-size:14px;font-weight:600;margin-bottom:1px">${esc(examName)}</div>
          <div class="text-sm text-muted">已答 ${answeredCount} / ${total} 题</div>
        </div>
        <div class="timer" id="examTimer">--:--</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="${ex.owners ? "navigateTo('wrong')" : "navigateTo('setDetail')"}">退出</button>
          <button class="btn btn-primary btn-sm" onclick="submitExam(false)">交卷</button>
        </div>
      </div>

      <div class="question-header">
        <span class="question-number">第 ${ex.current + 1} 题 · 共 ${total} 题</span>
        <span style="display:flex;gap:8px;align-items:center">
          <span class="badge ${TYPE_CLASS[q.type] || 'badge-muted'}">${TYPE_LABEL[q.type] || q.type}</span>
          ${difficultyDots(q.difficulty)}
        </span>
      </div>

      <div class="question-text" data-no-i18n>${esc(q.content)}</div>
      ${bodyHtml}

      <div class="nav-buttons">
        <button class="btn btn-secondary" ${ex.current === 0 ? 'disabled' : ''} onclick="examPrev()">← 上一题</button>
        ${ex.current === total - 1
          ? `<button class="btn btn-primary" onclick="submitExam(false)">交卷</button>`
          : `<button class="btn btn-primary" onclick="examNext()">下一题 →</button>`}
      </div>

      ${buildQuestionNav({
        mode: 'exam',
        current: ex.current,
        total,
        answeredCount,
        items: navItems,
        prevAction: 'examPrev()',
        nextAction: 'examNext()',
        finishLabel: '交卷',
        finishAction: 'submitExam(false)',
        finishClass: 'btn-primary'
      })}
    </div>`;
}

function isAnswered(q, ans) {
  if (q.type === 'code') return !!(ans && String(ans).trim());
  if (q.type === 'multi') return Array.isArray(ans) && ans.length > 0;
  return ans !== null && ans !== undefined && ans !== '';
}

function examChoose(idx) {
  const ex = state.exam;
  if (!ex) return;
  const q = ex.questions[ex.current];
  if (!q || q.type === 'multi' || q.type === 'fill' || q.type === 'code') return;
  ex.answers[ex.current] = q.type === 'tf' ? idx === 0 : idx;
  persistExam();
  render();
}

function examToggleMulti(idx) {
  const ex = state.exam;
  if (!ex) return;
  let cur = Array.isArray(ex.answers[ex.current]) ? [...ex.answers[ex.current]] : [];
  if (cur.includes(idx)) cur = cur.filter((i) => i !== idx);
  else cur.push(idx);
  ex.answers[ex.current] = cur;
  persistExam();
  render();
}

function examFillInput(i, val) {
  if (!state.exam) return;
  state.exam.answers[i] = val;
  persistExamSoon();
}

function examCodeInput(i, val) {
  if (!state.exam) return;
  state.exam.answers[i] = val;
  persistExamSoon();
}

function examGo(i) {
  const ex = state.exam;
  if (!ex) return;
  if (i < 0 || i >= ex.questions.length) return;
  ex.current = i;
  closeQnavAfterJump();
  persistExam();
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function abandonExam() {
  clearExamTimer();
  clearSession('exam');
  const setId = state.setId;
  state.exam = null;
  state.view = setId ? 'setDetail' : 'sets';
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

function examPrev() {
  const ex = state.exam;
  if (!ex) return;
  if (ex.current > 0) examGo(ex.current - 1);
}

function examNext() {
  const ex = state.exam;
  if (!ex) return;
  if (ex.current < ex.questions.length - 1) examGo(ex.current + 1);
}

function startExamTimer() {
  const ex = state.exam;
  if (!ex) return;
  const tick = () => {
    const el = document.getElementById('examTimer');
    if (!el) return;
    const left = Math.max(0, Math.floor((ex.deadline - Date.now()) / 1000));
    el.textContent = fmtTime(left);
    el.classList.toggle('warning', left <= 300 && left > 60);
    el.classList.toggle('danger', left <= 60);
    if (left <= 0) {
      clearExamTimer();
      submitExam(true);
    }
  };
  tick();
  ex.timerId = setInterval(tick, 1000);
}

function clearExamTimer() {
  if (state.exam && state.exam.timerId) {
    clearInterval(state.exam.timerId);
    state.exam.timerId = null;
  }
}

function submitExam(auto) {
  const ex = state.exam;
  if (!ex || ex.grading) return;
  const unanswered = ex.questions.filter((q, i) => !isAnswered(q, ex.answers[i])).length;
  if (auto) { confirmSubmitExam(); return; }
  const msg = unanswered > 0
    ? `还有 ${unanswered} 题未作答，交卷后将无法修改，确定交卷吗？`
    : '所有题目已作答，确定交卷吗？';
  confirmModal('确认交卷', msg, '交卷', () => confirmSubmitExam(), false);
}

async function confirmSubmitExam() {
  closeModal();
  const ex = state.exam;
  if (!ex || ex.grading) return;
  ex.grading = true;
  clearExamTimer();
  render();

  const gradedAnswers = [];
  let judgeFailed = false;

  for (let i = 0; i < ex.questions.length; i++) {
    const q = ex.questions[i];
    const ans = ex.answers[i];
    if (q.type === 'code') {
      if (!isAnswered(q, ans)) {
        gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: false });
        continue;
      }
      try {
        const tests = (q.testCases || []).slice(0, 3);
        if (!tests.length) {
          gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: null });
          continue;
        }
        let allPass = true;
        for (const t of tests) {
          const result = await judgeRun(q.language || 'javascript', ans + '\n' + t.input, '');
          const stdout = (result.stdout || '').trim();
          if (stdout !== String(t.expectedOutput).trim()) { allPass = false; break; }
        }
        gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: allPass });
      } catch (e) {
        judgeFailed = true;
        gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: null });
      }
    } else if (!isAnswered(q, ans)) {
      gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: false });
    } else {
      gradedAnswers.push({ setId: examOwnerAt(ex, i), qid: q.id, type: q.type, userAnswer: ans, correct: gradeObjective(q, ans) });
    }
  }

  const graded = gradedAnswers.filter((a) => a.correct !== null).length;
  const correct = gradedAnswers.filter((a) => a.correct === true).length;
  const ungraded = gradedAnswers.filter((a) => a.correct === null).length;
  const finishedAt = Date.now();
  const attemptId = examAttemptId(ex);

  // 交卷是整批评分：逐题只改内存，最后统一落一次盘；未评分的题不动错题本
  gradedAnswers.forEach((a) => {
    updateWrongBank(a.setId, a.qid, a.correct, { attemptId, at: finishedAt, silent: true });
  });
  saveJSON(STORAGE.wrong, wrongBank);

  // 错题模拟会跨练习集组卷：成绩按所属练习集拆开写历史，各科的统计才不会被混在一起
  const attempts = recordAttemptsBySet(gradedAnswers, {
    mode: 'exam',
    setId: ex.setId,
    setName: ex.name,
    startedAt: ex.startedAt,
    finishedAt,
    durationSec: Math.round((finishedAt - ex.startedAt) / 1000)
  });
  const historySaved = pushAttempts(attempts);

  const result = {
    id: attempts.length === 1 ? attempts[0].id : attemptId,
    setId: ex.setId,
    setName: ex.name || (getSet(ex.setId) || {}).name || '考试',
    mixed: attempts.length > 1,
    mock: !!ex.mock,
    setCount: attempts.length,
    mode: 'exam',
    startedAt: ex.startedAt,
    finishedAt,
    durationSec: Math.round((finishedAt - ex.startedAt) / 1000),
    total: ex.questions.length,
    graded,
    correct,
    ungraded,
    score: graded ? Math.round((correct / graded) * 100) : 0,
    answers: gradedAnswers,
    ...(attempts.length === 1 && attempts[0].planResult ? { planResult: attempts[0].planResult } : {})
  };

  clearSession('exam');
  state.exam = null;
  state.examResult = result;
  state.view = 'examResult';
  render();
  if (judgeFailed) toast('部分编程题因判题服务不可用而未评分', 'info', 4000);
  if (!historySaved) toast('这次成绩未能写入本地存储，建议先导出备份', 'error', 5000);
}

function renderGrading() {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px">
    <div class="spinner spinner-lg"></div>
    <div style="font-size:15px;color:var(--text-secondary)">正在评分...</div>
    <div class="text-sm text-muted">编程题正在运行测试用例，请稍候</div>
  </div>`;
}

/* 交卷后的「下一步」：单练习集考的是整套题，重做口径跟着练习集错题本走；
   错题模拟只把这次真答错的题拉回来重练，不然会越滚越大。
   mock = 这张卷子来自错题模拟（哪怕只抽到一个练习集里），mixed = 跨了练习集，两者口径一致。 */
function isMockPaper(a) {
  return !!a && (!!a.mock || !!a.mixed);
}

function wrongItemsFromAnswers(answers) {
  const out = [];
  arrOf(answers).forEach((x) => {
    if (!x || x.correct !== false) return;
    const set = getSet(strOf(x.setId, 80));
    const q = getQuestion(set, strOf(x.qid, 64));
    if (q) out.push({ setId: set.id, qid: q.id, q, set });
  });
  return out;
}

function resultWrongItems(a) {
  if (!a) return [];
  return isMockPaper(a) ? wrongItemsFromAnswers(a.answers) : wrongOpenItems(a.setId);
}

function redoResultWrong() {
  const a = state.examResult;
  if (!a) return;
  if (isMockPaper(a)) startWrongPractice(resultWrongItems(a), '本次模拟的错题');
  else startLearning(a.setId, true);
}

// 交卷之后回到复习节奏：这一页说清错题本还剩多少、今天该练哪些
function wrongFollowUpHTML() {
  const s = wrongStats();
  if (!s.open) return '';
  const parts = [`错题本还有 ${s.open} 道待复习`, s.due ? `今日到期 ${s.due} 道` : '下一批还没到时间'];
  if (s.stubborn) parts.push(`顽固 ${s.stubborn} 道`);
  return `<p class="text-sm text-muted follow-up">${parts.join(' · ')}</p>`;
}

function renderExamResult() {
  const a = state.examResult;
  if (!a) return `<div class="empty-state"><div class="empty-state-title">没有结果</div><button class="btn btn-primary" onclick="navigateTo('sets')">返回练习科目</button></div>`;
  const set = a.mixed ? null : getSet(a.setId);
  const mock = isMockPaper(a);
  // 交卷不是终点：这一页要立刻给出下一步——重做刚错的题，或直接练下一套
  const redoItems = resultWrongItems(a);
  const next = mock || !set ? null : nextSetAfter(a.setId);
  const level = a.score >= 85 ? 'high' : a.score >= 60 ? 'medium' : 'low';
  const label = a.score >= 85 ? '优秀' : a.score >= 60 ? '合格' : '需要加强';

  return `
    <div class="results-container">
      <div class="results-card">
        <div class="score-badge ${level}">
          <span class="results-score ${level}">${a.score}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="results-label"><b>${label}</b> · ${a.mode === 'exam' ? '考试模式' : '学习模式'}${mock ? ` · <span>${esc(a.setName)}</span>` : ''}</div>

        <div class="results-stats">
          <div class="result-stat"><div class="result-stat-value" style="color:var(--success)">${a.correct}</div><div class="result-stat-label">答对</div></div>
          <div class="result-stat"><div class="result-stat-value" style="color:var(--danger)">${a.graded - a.correct}</div><div class="result-stat-label">答错</div></div>
          <div class="result-stat"><div class="result-stat-value">${fmtDuration(a.durationSec)}</div><div class="result-stat-label">用时</div></div>
        </div>
        ${a.ungraded ? `<p class="text-sm text-muted" style="margin-top:12px">另有 ${a.ungraded} 题未作答或未评分，不计入得分</p>` : ''}
      </div>

      ${renderPlanReceiptCard(receiptForAttempt(a))}

      <div class="btn-group" style="justify-content:center;margin-bottom:14px;flex-wrap:wrap">
        ${redoItems.length ? `<button class="btn btn-primary" onclick="redoResultWrong()">重做错题 ${redoItems.length} 题</button>` : ''}
        ${next ? `<button class="btn ${redoItems.length ? 'btn-secondary' : 'btn-primary'}" onclick="openSet('${next.id}')">练下一套 · <span data-no-i18n>${esc(next.name)}</span></button>` : ''}
      </div>
      ${wrongFollowUpHTML()}
      <div class="btn-group" style="justify-content:center;margin-bottom:28px;flex-wrap:wrap">
        ${set && !mock ? `<button class="btn btn-ghost" onclick="startExamModal('${set.id}')">再考一次</button>` : ''}
        ${set ? `<button class="btn btn-ghost" onclick="openSet('${set.id}')">返回练习集</button>` : ''}
        ${mock ? `<button class="btn btn-ghost" onclick="navigateTo('wrong')">回到错题本</button>` : ''}
        <button class="btn btn-ghost" onclick="navigateTo('sets')">回到练习科目</button>
      </div>

      ${arrOf(a.answers).length ? `
        <div class="section-title" style="text-align:left">答题回顾</div>
        ${a.answers.map((ans, i) => {
          const owner = getSet(strOf(ans.setId, 80)) || set;
          const q = getQuestion(owner, ans.qid);
          if (!q) return '';
          const cls = ans.correct === true ? 'correct' : ans.correct === false ? 'incorrect' : '';
          const statusCls = ans.correct === true ? 'badge-success' : ans.correct === false ? 'badge-danger' : 'badge-muted';
          const status = ans.correct === true ? '✓ 正确' : ans.correct === false ? '✕ 错误' : '— 未评分';
          return `<div class="review-item ${cls}">
            <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;align-items:center">
              <span class="badge ${TYPE_CLASS[q.type] || 'badge-muted'}">${TYPE_LABEL[q.type] || q.type}</span>
              <span class="badge ${statusCls}">${status}</span>
            </div>
            <div class="review-question">${i + 1}. <span data-no-i18n>${esc(q.content)}</span></div>
            <div class="review-answer">你的答案：<span class="${ans.correct ? 'correct-text' : 'wrong-text'}" data-no-i18n>${esc(userAnswerText(q, ans.userAnswer))}</span></div>
            ${ans.correct !== true ? `<div class="review-answer">正确答案：<span class="correct-text" data-no-i18n>${esc(answerText(q))}</span></div>` : ''}
            ${q.explanation ? `<div class="review-answer" data-no-i18n style="margin-top:8px;color:var(--text-secondary)">${esc(q.explanation)}</div>` : ''}
            ${q.type === 'code' && q.answer ? `<div class="code-output" style="margin-top:12px"><div class="output-label">参考答案</div><span data-no-i18n>${esc(q.answer)}</span></div>` : ''}
          </div>`;
        }).join('')}` : ''}
    </div>`;
}

/* 错题本：答错的题由两种模式在评分时写进 v2 信封（recordWrong / archiveWrong），
   这里只负责「今天该练哪些」——按考点收纳、一键只练这组、组一套错题模拟。
   口径统一走 wrongItems / wrongStats，视图层不再自己遍历 bySet。 */

const WRONG_FILTERS = ['open', 'stubborn', 'mastered', 'all'];
const WRONG_FILTER_LABEL = { open: '未掌握', stubborn: '顽固', mastered: '已掌握', all: '全部' };
const WRONG_GROUP_LIMIT = 12;

function wrongFilterValue() {
  return WRONG_FILTERS.includes(state.wrongFilter) ? state.wrongFilter : 'open';
}

function wrongSortValue() {
  return state.wrongSort === 'recent' ? 'recent' : 'priority';
}

function setWrongFilter(value) {
  if (!WRONG_FILTERS.includes(value)) return;
  state.wrongFilter = value;
  render();
}

function setWrongSort(value) {
  state.wrongSort = value === 'recent' ? 'recent' : 'priority';
  render();
}

function wrongFilteredItems() {
  const filter = wrongFilterValue();
  const all = wrongItems();
  const list = filter === 'all'
    ? all
    : filter === 'mastered'
      ? all.filter((i) => i.entry.status === 'mastered')
      : filter === 'stubborn'
        ? all.filter((i) => i.entry.status === 'open' && isStubbornWrong(i.entry))
        : all.filter((i) => i.entry.status === 'open');
  if (filter === 'mastered') {
    return list.sort((a, b) => (b.entry.lastCorrectAt || 0) - (a.entry.lastCorrectAt || 0));
  }
  return wrongSortValue() === 'recent'
    ? list.sort((a, b) => (b.entry.lastWrongAt || 0) - (a.entry.lastWrongAt || 0))
    : list.sort(wrongPriorityCompare);
}

// 到期提示只说「什么时候能再练」，间隔算法留在数据层
function wrongDueLabel(entry) {
  if (!entry) return '';
  if (entry.status === 'mastered') {
    return entry.lastCorrectAt ? `已于 ${fmtDate(entry.lastCorrectAt)} 掌握` : '已掌握';
  }
  const due = wrongDueAt(entry);
  if (due === null) return '';
  if (due <= Date.now()) return '今天可复习';
  const days = Math.max(1, Math.ceil((due - Date.now()) / WRONG_DAY_MS));
  return days === 1 ? '明天可复习' : `${days} 天后可复习`;
}

function wrongRowHTML(item) {
  const e = item.entry;
  const mastered = e.status === 'mastered';
  const stubborn = isStubbornWrong(e);
  const a = setAccent(item.set);
  const badge = mastered
    ? '<span class="badge badge-success">已掌握</span>'
    : `<span class="badge ${stubborn ? 'badge-danger' : 'badge-muted'}">错 ${e.times} 次</span>`;
  const acts = mastered
    ? `<button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation();undoMastered('${item.setId}', '${item.qid}')">重新列入</button>`
    : `<button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation();dismissWrong('${item.setId}', '${item.qid}')">移出</button>`;
  const openSetAction = `openSet('${item.setId}')`;
  return `
    <div class="lrow lrow-tap" role="button" tabindex="0" title="回到原练习集"
      onclick="${openSetAction}"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${openSetAction}}">
      <span class="lrow-dot" aria-hidden="true" style="background:${a.bar}"></span>
      <span class="lrow-main">
        <span class="lrow-title"><span class="lrow-name" data-no-i18n>${esc((item.q.content || '').split('\n')[0])}</span></span>
        <span class="lrow-sub"><span data-no-i18n>${esc(item.set.name)}</span> · ${esc(wrongDueLabel(e))}</span>
      </span>
      ${badge}
      <span class="lrow-acts">${acts}</span>
      <span class="lrow-go" aria-hidden="true">→</span>
    </div>`;
}

function wrongGroupHTML(g, idx, open) {
  const openCount = g.items.filter((i) => i.entry.status === 'open').length;
  const actions = openCount
    ? `<button type="button" class="btn btn-primary btn-sm" onclick="event.preventDefault();event.stopPropagation();startWrongGroup(${idx})">只练这组</button>`
    : '';
  return foldSection({
    title: g.title || '未归类考点',
    nameIsData: !!g.title,
    chip: `${g.items.length} 题 · 错 ${g.wrongTimes} 次`,
    actions,
    open,
    body: `<div class="lrow-list">${g.items.map(wrongRowHTML).join('')}</div>`
  });
}

function startWrongGroup(idx) {
  const g = (state.wrongGroups || [])[idx];
  if (!g) return;
  const items = g.items.filter((i) => i.entry.status === 'open');
  startWrongPractice(items, g.title || '错题重练');
}

function undoMastered(setId, qid) {
  if (reopenWrong(setId, qid)) {
    toast('已重新列入待复习', 'success');
    render();
  }
}

function dismissWrong(setId, qid) {
  if (dropWrong(setId, qid)) {
    toast('这道题已移出错题本', 'info');
    render();
  }
}

function renderWrongBook() {
  const stats = wrongStats();
  if (!stats.total) {
    return `
      <div class="empty-card">
        <div class="empty-card-icon">${ICON.target}</div>
        <div class="empty-card-title">暂无错题</div>
        <div class="empty-card-desc">学习和考试里答错的题会自动记到这里，按考点收纳；答对一次就归档为已掌握，可以随时重新列入。</div>
      </div>
      <div class="btn-group" style="justify-content:center;margin-top:18px">
        <button class="btn btn-primary" onclick="navigateTo('sets')">挑一个练习科目</button>
      </div>`;
  }

  const items = wrongFilteredItems();
  const groups = groupWrongByKp(items);
  state.wrongGroups = groups;
  const filter = wrongFilterValue();

  const shown = groups.slice(0, WRONG_GROUP_LIMIT);
  const rest = groups.slice(WRONG_GROUP_LIMIT);

  const chips = WRONG_FILTERS.map((key) => {
    const n = key === 'all' ? stats.total : key === 'mastered' ? stats.mastered : key === 'stubborn' ? stats.stubborn : stats.open;
    return `<button type="button" class="filter-chip${filter === key ? ' is-on' : ''}" onclick="setWrongFilter('${key}')" aria-pressed="${filter === key}">${WRONG_FILTER_LABEL[key]}<b>${n}</b></button>`;
  }).join('');

  return `
    <p class="page-lead">答错自动进账，答对一次即归档为已掌握。按考点练最省时间——同一个考点错得越多，排得越前。</p>

    <div class="stat-rail">
      ${statCard('待复习', `${stats.open}`, { icon: ICON.target, note: stats.due ? `今日到期 ${stats.due} 题` : '还没有到复习时间' })}
      ${statCard('顽固错题', `${stats.stubborn}`, { icon: ICON.flame, note: stats.stubborn ? '错过 3 次以上，每天都要见一面' : '暂时没有反复错的题' })}
      ${statCard('已掌握', `${stats.mastered}`, { icon: ICON.archive, note: stats.mastered ? '答对一次即归档，可重新列入' : '还没有归档的错题' })}
      ${statCard('最弱考点', `${stats.weakest ? stats.weakest.items.length : 0}`, {
        icon: ICON.bulb,
        // 有考点名时它是用户数据（保留原文）；没有考点名时「未归类考点」是界面兜底文案，得让词典翻它
        noteHTML: stats.weakest ? (stats.weakest.title ? `<span data-no-i18n>${esc(stats.weakest.title)}</span>` : '未归类考点') : '先答错题才会形成考点画像'
      })}
    </div>

    <div class="wrong-bar">
      <div class="filter-row">${chips}</div>
      <div class="wrong-bar-tail">
        <label class="ui-muted" for="wrongSort">排序</label>
        <select class="form-select" id="wrongSort" onchange="setWrongSort(this.value)">
          <option value="priority"${wrongSortValue() === 'priority' ? ' selected' : ''}>先练顽固的</option>
          <option value="recent"${wrongSortValue() === 'recent' ? ' selected' : ''}>最近答错的</option>
        </select>
        <button type="button" class="btn btn-primary btn-sm" onclick="startWrongMockModal()">组一套错题模拟</button>
      </div>
    </div>

    ${groups.length ? `
      <div class="section-title"><span>考点收纳<span class="section-count">${groups.length}</span></span></div>
      ${shown.map((g, i) => wrongGroupHTML(g, i, i === 0)).join('')}
      ${rest.length ? `
        <details class="hist-more">
          <summary>展开其余 ${rest.length} 个考点</summary>
          ${rest.map((g, i) => wrongGroupHTML(g, shown.length + i, false)).join('')}
        </details>` : ''}` : `
      <div class="card"><div class="material-empty">这个筛选下暂时没有题目。换个筛选看看，或去练习集里再练一轮。</div></div>`}`;
}

function storageUsage() {
  let bytes = 0;
  [...Object.values(STORAGE), ...Object.values(SESSION_KEYS)].forEach((key) => {
    try {
      const v = localStorage.getItem(key);
      if (v) bytes += (v.length + key.length) * 2;
    } catch {}
  });
  const pct = bytes ? Math.max(1, Math.min(100, Math.round((bytes / STORAGE_LIMIT_BYTES) * 100))) : 0;
  const label = bytes < 1024 * 1024
    ? `${bytes ? Math.max(1, Math.round(bytes / 1024)) : 0} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
  return { bytes, pct, label };
}

function renderSettings() {
  const usage = storageUsage();
  return `
    <div class="settings-wrap">
    <div class="settings-section">
      <h3>界面语言</h3>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">显示语言</div>
          <div class="text-sm text-muted">切换后所有页面即时生效，偏好只保存在本浏览器。题目和资料内容跟随原文，不会被翻译。</div>
        </div>
        <div class="lang-seg" data-no-i18n role="group" aria-label="显示语言">
          <button type="button" class="${isEn() ? '' : 'is-active'}" onclick="setLang('zh')" aria-pressed="${!isEn()}">简体中文</button>
          <button type="button" class="${isEn() ? 'is-active' : ''}" onclick="setLang('en')" aria-pressed="${isEn()}">English</button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>AI 出题</h3>
      <p class="text-sm text-muted mb-4">已内置 Qoder AI，无需填写 API Key。上传 PDF、Word、PPT 等资料，系统自动提取文字并按篇幅推荐题量，生成单选、多选、判断、填空和编程题；没有文件时也可以直接粘贴文字。</p>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">出题引擎</div>
          <div class="text-sm text-muted">Qoder AI · 由站点后端安全调用，密钥不会进入浏览器</div>
        </div>
        <span class="badge badge-success">已内置</span>
      </div>
    </div>

    <div class="settings-section">
      <h3>判题服务</h3>
      <p class="text-sm text-muted">编程题通过后端调用 Judge0 公共实例判题，默认无需额外配置。如需使用私有 Judge0 或 RapidAPI 密钥，请在站点后端环境变量中配置 JUDGE0_URL / JUDGE0_KEY。</p>
    </div>

    <div class="settings-section">
      <h3>数据管理</h3>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">导出全部数据</div>
          <div class="text-sm text-muted">练习集、练习科目、资料文字、练习记录与错题本（不含原始文件）</div>
        </div>
        <button class="btn btn-secondary" onclick="exportData()">导出 JSON</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">导入数据备份</div>
          <div class="text-sm text-muted">从导出的 JSON 恢复，已存在的练习集、资料与记录会自动跳过</div>
        </div>
        <button class="btn btn-secondary" onclick="importData()">选择文件</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">本地存储</div>
          <div class="text-sm text-muted">练习集与记录已用 ${usage.label}（上限约 5 MB）${materials.length ? ` · 资料库 ${materials.length} 份，原始文件单独存放` : ''}</div>
        </div>
        <span class="badge ${usage.pct >= 80 ? 'badge-danger' : 'badge-muted'}">${usage.pct}%</span>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">清空练习记录</div>
          <div class="text-sm text-muted">清除所有历史成绩与错题本，保留练习集</div>
        </div>
        <button class="btn btn-secondary" onclick="clearRecords()">清空</button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">恢复初始状态</div>
          <div class="text-sm text-muted">删除所有自建练习集、练习科目、资料、记录与设置</div>
        </div>
        <button class="btn btn-danger" onclick="resetAll()">重置</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>备考规划</h3>
      <p class="text-sm text-muted">复习计划、每日任务与考点梳理在「Exam Plan AI 备考规划」里完成，这里负责出题与练习。两个应用通过考点深链互相跳转，数据各自保存在本地浏览器，不会互相同步。</p>
      <div class="settings-row">
        <div>
          <div class="settings-row-title">Exam Plan AI 备考规划</div>
          <div class="text-sm text-muted">由资料生成复习计划，按考点一键跳转到这里出题</div>
        </div>
        <a class="btn btn-secondary" href="${EXAM_PLAN_URL}" target="_blank" rel="noopener noreferrer">打开备考规划 ↗</a>
      </div>
    </div>

    <div class="settings-footer">
      <p>智题 StarQuiz · 学习模式与考试模式，普通题目与编程题混合练习，数据保存在本地浏览器。</p>
      <p class="settings-footer-sub">复习计划在 Exam Plan AI 里完成，两个应用通过考点深链互相跳转。</p>
    </div>
    </div>`;
}

function exportData() {
  const materialBackup = materials.map((m) => ({
    id: m.id,
    subjectId: m.subjectId,
    name: m.name,
    size: m.size,
    ext: m.ext,
    kind: m.kind,
    pages: m.pages,
    chars: m.chars,
    addedAt: m.addedAt,
    text: m.text
  }));
  const data = {
    // v3：错题本从「计数表」换成带时间戳和状态的信封；v2/v1 备份仍能导入（repairWrong 两种形状都读）
    version: 3,
    exportedAt: new Date().toISOString(),
    sets: customSets,
    history,
    wrongBank,
    subjects: userSubjects,
    materials: materialBackup
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `starquiz-export-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('已导出数据文件（资料只含提取文字，不含原始文件）', 'success', 4500);
}

const MAX_IMPORT_BYTES = 12 * 1024 * 1024;

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.display = 'none';
  input.onchange = () => {
    const file = input.files && input.files[0];
    input.remove();
    if (file) importBackupFile(file);
  };
  document.body.appendChild(input);
  input.click();
}

async function importBackupFile(file) {
  try {
    await importBackupFileCore(file);
  } catch (e) {
    console.error('[StarQuiz] 导入失败', e);
    toast(`导入失败：${(e && e.message) || '数据格式异常'}`, 'error', 5000);
  }
}

async function importBackupFileCore(file) {
  if (file.size > MAX_IMPORT_BYTES) {
    toast('备份文件超过 12 MB，请拆分后再导入', 'error', 5000);
    return;
  }
  let data = null;
  try {
    data = JSON.parse(await file.text());
  } catch {
    toast('不是有效的 JSON 备份文件', 'error');
    return;
  }
  if (Array.isArray(data)) data = { sets: data };
  if (!data || typeof data !== 'object') {
    toast('备份格式不正确', 'error');
    return;
  }
  const rawSets = arrOf(data.sets || data.customSets);
  const rawHistory = arrOf(data.history);
  const rawWrong = objOf(data.wrongBank || data.wrong);
  const rawSubjects = arrOf(data.subjects);
  const rawMaterials = arrOf(data.materials);
  if (!rawSets.length && !rawHistory.length && !rawSubjects.length && !rawMaterials.length && !wrongBankSetCount(rawWrong)) {
    toast('备份里没有可导入的数据', 'info');
    return;
  }

  const knownIds = new Set(allSets().map((s) => s.id));
  let skippedSets = 0;
  const pendingSets = [];
  rawSets.forEach((raw) => {
    const id = raw && typeof raw.id === 'string' ? raw.id : '';
    if (id && knownIds.has(id)) { skippedSets++; return; }
    pendingSets.push(raw);
  });
  const sanitized = sanitizeStoredSets(pendingSets, knownIds);

  const snapshotSets = customSets.length;
  const snapshotHistory = history.length;
  const snapshotWrong = JSON.stringify(wrongBank);

  let addedSets = 0;
  let addedQuestions = 0;
  sanitized.sets.forEach((s) => {
    customSets.push(s);
    addedSets++;
    addedQuestions += s.questions.length;
  });

  let addedHistory = 0;
  let addedWrong = 0;
  const seenHistory = new Set(history.map((a) => a.id));
  repairHistory(rawHistory).forEach((a) => {
    if (seenHistory.has(a.id)) return;
    seenHistory.add(a.id);
    history.push(a);
    addedHistory++;
  });
  history = history.sort((x, y) => y.finishedAt - x.finishedAt).slice(0, 200);

  // 备份里的错题按「新集优先」合并；时间戳用刚合并完的历史回推，v1 备份也能升上来
  const wrongPatch = repairWrong(rawWrong, history);
  Object.keys(wrongPatch.bySet).forEach((setId) => {
    const target = wrongBank.bySet[setId] || (wrongBank.bySet[setId] = {});
    Object.keys(wrongPatch.bySet[setId]).forEach((qid) => {
      if (!target[qid]) addedWrong++;
      target[qid] = mergeWrongEntry(target[qid], wrongPatch.bySet[setId][qid]);
    });
    if (!Object.keys(target).length) delete wrongBank.bySet[setId];
  });

  const okSets = saveJSONQuiet(STORAGE.sets, customSets);
  const okHistory = saveJSONQuiet(STORAGE.history, history);
  const okWrong = saveJSONQuiet(STORAGE.wrong, wrongBank);
  if (!okSets || !okHistory || !okWrong) {
    customSets.length = snapshotSets;
    history.length = snapshotHistory;
    wrongBank = JSON.parse(snapshotWrong);
    toast('导入失败：本地存储空间不足。请先导出并清理不用的练习集', 'error', 6000);
    return;
  }

  // 练习科目与资料（资料只恢复提取的文字，原始文件不包含在 JSON 备份里）
  let addedSubjects = 0;
  if (rawSubjects.length) {
    const before = new Set(userSubjects.map((s) => s.id));
    const merged = sanitizeSubjects([...userSubjects, ...rawSubjects]);
    const additions = merged.filter((s) => !before.has(s.id));
    if (additions.length) {
      if (saveJSONQuiet(STORAGE.subjects, merged)) {
        userSubjects = merged;
        addedSubjects = additions.length;
      } else {
        bootNotes.push('练习科目导入失败：本地存储空间不足');
      }
    }
  }

  let addedMaterials = 0;
  let skippedMaterials = 0;
  if (rawMaterials.length) {
    if (materialsUnavailable) {
      skippedMaterials = rawMaterials.length;
    } else {
      const existingKeys = new Set(materials.map((m) => `${m.subjectId}|${m.name}|${m.size}`));
      for (const raw of rawMaterials.slice(0, 300)) {
        const meta = sanitizeMaterialMeta(raw);
        if (!meta) continue;
        if (!subjectById(meta.subjectId)) meta.subjectId = 'sub-inbox';
        const key = `${meta.subjectId}|${meta.name}|${meta.size}`;
        if (existingKeys.has(key) || materials.some((m) => m.id === meta.id)) { skippedMaterials++; continue; }
        try {
          const saved = await saveMaterialRecord(meta, null);
          materials.unshift(saved);
          existingKeys.add(key);
          addedMaterials++;
        } catch {
          skippedMaterials++;
        }
      }
      materials.sort((a, b) => b.addedAt - a.addedAt);
    }
  }

  const skippedQuestions = sanitized.droppedQuestions || 0;
  const invalidSets = sanitized.droppedSets || 0;
  const parts = [];
  if (addedSets) parts.push(`${addedSets} 个练习集（${addedQuestions} 题）`);
  if (addedHistory) parts.push(`${addedHistory} 条记录`);
  if (addedWrong) parts.push(`${addedWrong} 道错题`);
  if (addedSubjects) parts.push(`${addedSubjects} 个练习科目`);
  if (addedMaterials) parts.push(`${addedMaterials} 份资料`);
  if (skippedSets) parts.push(`跳过 ${skippedSets} 个已存在的练习集`);
  if (skippedMaterials) parts.push(`跳过 ${skippedMaterials} 份已存在的资料`);
  if (invalidSets) parts.push(`忽略 ${invalidSets} 个没有有效题目的练习集`);
  if (skippedQuestions) parts.push(`忽略 ${skippedQuestions} 道异常题目`);
  toast(parts.length ? `导入完成：${parts.join('，')}` : '没有可新增的数据，备份内容已全部存在', parts.length ? 'success' : 'info', 5000);
  render();
}

function clearRecords() {
  confirmModal('清空记录', '将清除所有练习历史和错题本，练习集不受影响。确定继续吗？', '清空', () => {
    history = [];
    wrongBank = emptyWrongBank();
    saveJSON(STORAGE.history, history);
    saveJSON(STORAGE.wrong, wrongBank);
    toast('记录已清空', 'success');
    render();
  }, true);
}

function resetAll() {
  confirmModal('恢复初始状态', '将删除所有自建练习集、练习科目、上传的资料、练习记录、错题本、考点联动关系和本地设置。确定继续吗？', '重置全部', async () => {
    Object.values(STORAGE).forEach((k) => { try { localStorage.removeItem(k); } catch {} });
    Object.values(SESSION_KEYS).forEach((k) => { try { localStorage.removeItem(k); } catch {} });
    try {
      const db = await openMaterialDb();
      await new Promise((resolve) => {
        const tx = db.transaction([MATERIAL_STORE, MATERIAL_FILE_STORE], 'readwrite');
        tx.objectStore(MATERIAL_STORE).clear();
        tx.objectStore(MATERIAL_FILE_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
    } catch {}
    clearExamTimer();
    resume = { exam: null, learning: null };
    customSets = [];
    history = [];
    wrongBank = emptyWrongBank();
    userSubjects = [];
    materials = [];
    planLinkStore = sanitizePlanLinks(null);
    planLink = null;
    state.lastPlanAttempt = null;
    state.exam = null;
    state.learning = null;
    state.subjectId = null;
    toast('已恢复初始状态', 'success');
    navigateTo('dashboard');
  }, true);
}

function normalizeSet(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('练习集数据不是对象');
  const name = String(raw.name || '').trim();
  if (!name) throw new Error('缺少练习集名称 name');
  const description = String(raw.description || '').trim();
  const icon = String(raw.icon || '题').slice(0, 8);
  const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t).slice(0, 20)).slice(0, 6) : [];
  const rawKps = Array.isArray(raw.knowledgePoints) ? raw.knowledgePoints : [];
  const knowledgePoints = rawKps.map((kp, i) => ({
    id: 'kp' + (i + 1),
    title: String(kp.title || `知识点 ${i + 1}`).slice(0, 60),
    content: String(kp.content || '')
  }));
  // 知识点会被重编号：先记下「原 id → 新 id」，否则题目引用的原 id 全部匹配不上，
  // 整套题的归属会被静默打散（内置样例用 kpA 这类 id 时尤其明显）
  const kpIdMap = new Map();
  rawKps.forEach((kp, i) => {
    const from = kp && kp.id !== null && kp.id !== undefined ? String(kp.id) : '';
    if (from) kpIdMap.set(from, 'kp' + (i + 1));
  });
  const rawQs = Array.isArray(raw.questions) ? raw.questions : [];
  if (!rawQs.length) throw new Error('练习集中没有题目');

  let quality = raw.quality && typeof raw.quality === 'object' ? {
    parsed: Number(raw.quality.parsed) || 0,
    kept: Number(raw.quality.kept) || 0,
    duplicates: Number(raw.quality.duplicates) || 0,
    removed: Number(raw.quality.removed) || 0,
    repaired: Number(raw.quality.repaired) || 0,
    issues: Array.isArray(raw.quality.issues) ? raw.quality.issues.slice(0, 30).map((issue) => ({
      index: Number(issue && issue.index) || 0,
      kind: String((issue && issue.kind) || ''),
      message: String((issue && issue.message) || ''),
      question: String((issue && issue.question) || '')
    })) : []
  } : null;
  const localIssues = [];

  const validTypes = ['single', 'multi', 'tf', 'fill', 'code'];
  const questions = [];
  rawQs.forEach((rq, i) => {
    try {
      const type = validTypes.includes(rq.type) ? rq.type : 'single';
      const content = String(rq.content || '').trim();
      if (!content) throw new Error(`第 ${i + 1} 题缺少题干`);
      const q = {
        id: 'q' + (questions.length + 1),
        type,
        difficulty: Math.min(3, Math.max(1, parseInt(rq.difficulty, 10) || 2)),
        content,
        explanation: String(rq.explanation || '')
      };
      // 只有明确匹配到知识点才认归属；兜底塞进第一个知识点的题保留 kpUnmatched 状态，
      // 后续联动成绩统计不能把这些题当成目标考点
      const mappedKp = kpIdMap.has(String(rq.knowledgePointId))
        ? kpIdMap.get(String(rq.knowledgePointId))
        : (knowledgePoints.some((k) => k.id === rq.knowledgePointId) ? rq.knowledgePointId : null);
      q.knowledgePointId = mappedKp || (knowledgePoints[0] ? knowledgePoints[0].id : null);
      if (!mappedKp || rq.kpUnmatched === true) q.kpUnmatched = true;
      if (type === 'single') {
        const opts = Array.isArray(rq.options) ? rq.options.map(String) : [];
        if (opts.length < 2) throw new Error(`第 ${i + 1} 题（单选）至少需要 2 个选项`);
        const ans = parseInt(rq.answer, 10);
        if (isNaN(ans) || ans < 0 || ans >= opts.length) throw new Error(`第 ${i + 1} 题（单选）answer 必须是有效选项索引`);
        q.options = opts;
        q.answer = ans;
      } else if (type === 'multi') {
        const opts = Array.isArray(rq.options) ? rq.options.map(String) : [];
        if (opts.length < 2) throw new Error(`第 ${i + 1} 题（多选）至少需要 2 个选项`);
        const arr = Array.isArray(rq.answer) ? rq.answer.map(Number) : [];
        if (!arr.length || arr.some((x) => isNaN(x) || x < 0 || x >= opts.length)) throw new Error(`第 ${i + 1} 题（多选）answer 必须是有效索引数组`);
        q.options = opts;
        q.answer = [...new Set(arr)].sort((a, b) => a - b);
      } else if (type === 'tf') {
        q.answer = rq.answer === true || rq.answer === 'true' || rq.answer === '正确' || rq.answer === 1;
      } else if (type === 'fill') {
        const arr = Array.isArray(rq.answer) ? rq.answer.map(String) : [String(rq.answer ?? '')];
        const cleaned = arr.map((s) => s.trim()).filter(Boolean);
        if (!cleaned.length) throw new Error(`第 ${i + 1} 题（填空）缺少答案`);
        q.answer = cleaned;
      } else if (type === 'code') {
        const lang = ['javascript', 'python', 'cpp', 'java'].includes(rq.language) ? rq.language : 'javascript';
        const tests = Array.isArray(rq.testCases) ? rq.testCases.map((t) => ({
          input: String(t.input || ''),
          expectedOutput: String(t.expectedOutput ?? '')
        })).filter((t) => t.input || t.expectedOutput) : [];
        q.language = lang;
        q.template = String(rq.template || '');
        q.answer = String(rq.answer || '');
        q.testCases = tests;
      }
      questions.push(q);
    } catch (e) {
      localIssues.push({
        index: i + 1,
        kind: 'client',
        message: (e && e.message) || '题目数据异常，已跳过',
        question: String(rq && rq.content || '').slice(0, 40)
      });
    }
  });

  if (!questions.length) throw new Error('练习集中没有可用的题目');

  if (localIssues.length) {
    if (!quality) quality = { parsed: rawQs.length, kept: 0, duplicates: 0, removed: 0, repaired: 0, issues: [] };
    quality.removed = (quality.removed || 0) + localIssues.length;
    quality.issues = [...quality.issues, ...localIssues].slice(0, 30);
  }
  if (quality) quality.kept = questions.length;

  // 两条清洗链都显式放行 source，联动来源才不会在刷新或备份导入后消失
  const source = sanitizeSetSource(raw.source, knowledgePoints.map((kp) => kp.id));
  // 出题来源与聚焦考点：详情页的「练习来源」备考上下文靠这两个字段
  const origin = SET_ORIGIN_KINDS.includes(String(raw.origin || '')) ? String(raw.origin) : '';
  const focusTopic = strOf(raw.focusTopic, PLAN_PARAM_LIMITS.topic).trim();

  return {
    id: 'custom-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: name.slice(0, 40),
    description: description.slice(0, 200),
    icon,
    tags,
    knowledgePoints,
    questions,
    ...(source ? { source } : {}),
    ...(origin ? { origin } : {}),
    ...(focusTopic ? { focusTopic } : {}),
    ...(quality ? { quality } : {})
  };
}

// 跨段去重用的归一化与相似度（与后端同一套阈值）
function aiDedupText(text) {
  return String(text || '')
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\u3000\u00a0\s]/g, '')
    .toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》〈〉·—…\-_.,!?;:()\[\]{}"'`~@#$%^&*+=|\\/<>]/g, '');
}

function aiBigrams(text) {
  const set = new Set();
  for (let i = 0; i < text.length - 1; i++) set.add(text.slice(i, i + 2));
  return set;
}

function aiSimilar(a, b) {
  const na = aiDedupText(a);
  const nb = aiDedupText(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length < 18 || nb.length < 18) return false;
  if (Math.abs(na.length - nb.length) > Math.max(na.length, nb.length) * 0.4) return false;
  const ga = aiBigrams(na);
  const gb = aiBigrams(nb);
  let inter = 0;
  for (const gram of ga) if (gb.has(gram)) inter++;
  if (inter / (ga.size + gb.size - inter) >= 0.86) return true;
  const [small, large] = na.length <= nb.length ? [na, nb] : [nb, na];
  return small.length / large.length >= 0.85 && large.includes(small);
}

// 真题分段并行整理后，把各段练习集按顺序拼成一份：知识点按标题去重，题目跨段去重
function mergeGeneratedSets(rawSets, partsMeta = []) {
  const list = rawSets.filter(Boolean);
  if (!list.length) throw new Error('AI 没有返回题目');
  if (list.length === 1) return list[0];

  const knowledgePoints = [];
  const byTitle = new Map();
  const questions = [];
  const seen = [];
  const issues = [];
  let duplicates = 0;
  let removed = 0;
  let repaired = 0;
  let parsed = 0;

  for (let index = 0; index < list.length; index++) {
    const item = list[index];
    const label = (partsMeta[index] && partsMeta[index].label) || '';
    const tag = label ? `${label} · ` : '';
    if (item.quality) {
      parsed += Number(item.quality.parsed) || 0;
      removed += Number(item.quality.removed) || 0;
      repaired += Number(item.quality.repaired) || 0;
      duplicates += Number(item.quality.duplicates) || 0;
      for (const issue of item.quality.issues || []) {
        if (issues.length < 30) issues.push(Object.assign({}, issue, { message: tag + String(issue.message || '') }));
      }
    }

    const remap = new Map();
    for (const kp of item.knowledgePoints || []) {
      const key = String(kp.title || '').trim().toLowerCase();
      let target = byTitle.get(key);
      if (!target && knowledgePoints.length < 12) {
        target = { id: 'kp' + (knowledgePoints.length + 1), title: kp.title, content: kp.content };
        knowledgePoints.push(target);
        byTitle.set(key, target);
      }
      if (target) remap.set(kp.id, target.id);
    }
    for (const question of item.questions || []) {
      if (seen.some((text) => aiSimilar(question.content, text))) {
        duplicates++;
        if (issues.length < 30) {
          issues.push({
            index: 0,
            kind: 'duplicate',
            message: `${tag}跨段重复，已合并`,
            question: String(question.content || '').slice(0, 40)
          });
        }
        continue;
      }
      seen.push(question.content);
      const copy = Object.assign({}, question);
      const remapped = remap.get(question.knowledgePointId);
      copy.knowledgePointId = remapped || (knowledgePoints[0] && knowledgePoints[0].id) || null;
      // 合并后知识点会重编号：映射丢失或原本就没归属的题，不能默认算进目标考点
      if (!remapped || question.kpUnmatched === true) copy.kpUnmatched = true;
      questions.push(copy);
    }
  }
  if (!questions.length) throw new Error('AI 没有返回题目');

  const first = list[0];
  const tags = [];
  for (const item of list) {
    for (const tag of item.tags || []) {
      const value = String(tag || '').trim();
      if (value && !tags.includes(value) && tags.length < 6) tags.push(value);
    }
  }
  return normalizeSet({
    name: first.name,
    description: first.description,
    icon: first.icon,
    tags,
    knowledgePoints,
    questions,
    quality: {
      parsed: parsed || questions.length + duplicates,
      kept: questions.length,
      duplicates,
      removed,
      repaired,
      issues
    }
  });
}

// 真题段：用原文题号数对比整理出的题数，明显偏少时提示可能漏题
function attachCoverage(set, parts) {
  const examParts = (parts || []).filter((part) => part.group === 'exam' && part.set);
  if (!examParts.length) return;
  const expected = examParts.reduce((n, part) => n + (part.expected || 0), 0);
  const actual = examParts.reduce((n, part) => n + part.set.questions.length, 0);
  if (expected < 3 || actual >= expected) return;
  if (!set.quality) {
    set.quality = { parsed: actual, kept: set.questions.length, duplicates: 0, removed: 0, repaired: 0, issues: [] };
  }
  set.quality.coverage = { expected, actual };
  set.quality.issues = [{
    index: 0,
    kind: 'coverage',
    message: `原文识别到约 ${expected} 道题号，本次整理出 ${actual} 道，可能有漏题`,
    question: ''
  }, ...(set.quality.issues || [])].slice(0, 30);
}

function renderQuality(set) {
  const quality = set && set.quality;
  if (!quality) return '';
  const bits = [];
  if (quality.duplicates) bits.push(`去重 ${quality.duplicates} 题`);
  if (quality.removed) bits.push(`剔除 ${quality.removed} 题异常数据`);
  if (quality.repaired) bits.push(`修正 ${quality.repaired} 题题型`);
  if (quality.coverage) bits.push('疑似漏题');
  const all = Array.isArray(quality.issues) ? quality.issues : [];
  const issues = all.slice(0, 8);
  const clean = !bits.length && !all.length;
  return `<div class="ai-quality">
    <div class="ai-quality-line${quality.coverage ? ' warn' : ''}">
      <span class="ai-quality-dot"></span>质检：${clean ? '未发现重复、答案缺失等问题' : esc(bits.join(' · '))}
    </div>
    ${issues.length ? `<details class="ai-quality-detail">
      <summary>查看 ${all.length > issues.length ? `前 ${issues.length} 条（共 ${all.length} 条）` : `${issues.length} 条`}提示</summary>
      <ul>${issues.map((issue) => `<li>${issue.index ? `第 ${issue.index} 题：` : ''}${esc(issue.message)}${issue.question ? `<span class="ai-quality-q">${esc(issue.question)}</span>` : ''}</li>`).join('')}</ul>
    </details>` : ''}
  </div>`;
}

let aiPieces = [];
let aiSeq = 0;
let aiParseBusy = false;
let aiLastRecommended = 0;
let aiMode = 'generate';
let aiSubjectId = null;
// 保存位置：existing = 已有练习科目，new = 当场新建；aiFocus = 是否只围绕一个考点出题
let aiDest = 'existing';
let aiFocus = false;

// 出题任务有两条通道：
//   同步批次（站点配了 DeepSeek Key）：一次请求只出一小批，浏览器并发编排；
//   Qoder AI 会话（兜底）：start / poll 两步，单个请求都很短。
// 网关约 60 秒掐断单个请求，所以两条通道都不让一次请求扛整份资料。
const AI_POLL_INTERVAL_MS = 1500;
const AI_POLL_DEADLINE_MS = 360000;
const AI_EXAM_DEADLINE_MS = 600000;
const AI_SYNC_CONCURRENCY = 3;
const AI_SYNC_RETRY_DELAYS = [800, 2500];
const OFFICIAL_SITE_URL = 'https://starquiz-zfc3er164xi.qoder.zone';

function aiErrorText(status, data) {
  const serverMsg = data && data.error && data.error.message;
  if (serverMsg) return serverMsg;
  if (status === 405) return `当前页面不支持后端服务（HTTP 405），AI 出题和判题需要在正式站点使用：${OFFICIAL_SITE_URL}`;
  if (status === 404) return '站点刚更新完，服务还在重启，请等十几秒后刷新页面再试';
  if (status === 408 || status === 504) return '出题服务响应超时，请稍后重试或拆分资料';
  if (status === 413) return '资料内容过大，请拆分后重试';
  if (status === 429) return 'AI 调用太频繁了，等几秒再试';
  if (status === 401 || status === 403) return '登录已失效，请刷新页面后重试';
  if (status === 502 || status === 503) {
    return `出题服务暂时没有响应（HTTP ${status}），可能刚更新完或网络不稳定，请再点一次生成`;
  }
  if (status >= 500) return `出题服务出错了（HTTP ${status}），请稍后重试`;
  return `网络或服务异常（HTTP ${status || '未知'}），没拿到出题结果，请重试`;
}

// 启动出题会话：发布站点时后端会短暂重启（约半分钟），这里用退避重试撑过去
const AI_START_RETRY_DELAYS = [600, 1200, 2500, 5000, 8000, 12000, 12000];
async function startAISession(payload, signal, onRetry) {
  let lastMessage = '';
  for (let attempt = 0; attempt <= AI_START_RETRY_DELAYS.length; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, AI_START_RETRY_DELAYS[attempt - 1]));
    let res = null;
    try {
      res = await fetch('/functions/v1/app/ai/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      lastMessage = '网络连接中断，请检查网络后再试';
      continue;
    }
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.ok) return data;
    // 网关返回的 HTML/空响应、5xx、部署窗口的 404 都值得再试；带业务错误的 4xx 直接报给用户
    const retryable = !data || res.status >= 500 || res.status === 404 || res.status === 408;
    lastMessage = aiErrorText(res.status, data);
    if (!retryable) throw new Error(lastMessage);
    if (onRetry && attempt < AI_START_RETRY_DELAYS.length) onRetry(attempt + 1);
  }
  throw new Error(lastMessage || 'AI 服务暂时不可用，请稍后重试');
}

// 并发上限的小工具：批次多时也不要一起压给上游，3 路并发最稳
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = new Array(Math.max(1, Math.min(limit, items.length))).fill(0).map(async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

// 同步批次：请求体与 /ai/start 完全一致，只多一个 jobIndex，
// 函数用同样的纯函数还原出这一批的提示词，生成后直接返回题目。
async function requestAISyncJob(payload, jobIndex, signal) {
  const body = JSON.stringify({ ...payload, jobIndex });
  let lastMessage = '';
  for (let attempt = 0; attempt <= AI_SYNC_RETRY_DELAYS.length; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, AI_SYNC_RETRY_DELAYS[attempt - 1]));
    let res = null;
    let data = null;
    try {
      res = await fetch('/functions/v1/app/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal
      });
      data = await res.json().catch(() => null);
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      lastMessage = '网络连接中断，请检查网络后再试';
      continue;
    }
    if (res.ok && data && data.ok && data.set) return data;
    // 一批失败多半是这一批太大或上游抖动：换个批次大小重跑没有意义，试两次就放弃这一批
    lastMessage = aiErrorText(res ? res.status : 0, data);
    if (data && data.error && data.error.code) throw new Error(lastMessage);
  }
  throw new Error(lastMessage || '这一批没有生成成功');
}

function updateAIGenerating(run, count, startedAt, doneParts = 0, totalParts = 1, mode = aiMode, parts = []) {
  const sub = run && run.querySelector('.ai-generating-sub');
  if (!sub) return;
  const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  if (mode === 'batch') {
    const noteParts = parts.filter((part) => part.group === 'note');
    const examParts = parts.filter((part) => part.group === 'exam');
    const bits = [];
    if (noteParts.length) bits.push(`笔记出题 ${noteParts.filter((part) => part.set).length}/${noteParts.length}`);
    if (examParts.length) bits.push(`真题整理 ${examParts.filter((part) => part.set).length}/${examParts.length} 段`);
    sub.textContent = `${bits.join(' · ')} · 已用时 ${seconds} 秒`;
  } else if (mode === 'exam') {
    sub.textContent = totalParts > 1
      ? `分 ${totalParts} 段并行整理 · 已完成 ${doneParts}/${totalParts} 段 · 已用时 ${seconds} 秒`
      : `整理全部真题 · 已用时 ${seconds} 秒`;
  } else {
    sub.textContent = `共 ${count} 题 · 已用时 ${seconds} 秒`;
  }
}

function aiVisibleChars(text) {
  return String(text || '').replace(/\s/g, '').length;
}

// 题量规则：与后端 functions/handler.ts 的 countRangeFor 保持一致
function aiCountRange(chars) {
  const min = 3;
  const max = Math.max(min, Math.min(40, Math.floor(chars / 120)));
  const rec = Math.max(min, Math.min(max, Math.round(chars / 300)));
  return { min, max, rec };
}

// 粗略识别"1. / 1、/（1）"这类题号，用于真题模式的提示，不作为硬性约束
function aiEstimateQuestions(text) {
  const lines = String(text || '').split('\n');
  let n = 0;
  for (const line of lines) {
    if (/^\s*[（(]\s*[0-9０-９]{1,3}\s*[）)]\s*\S/.test(line) || /^\s*(?:第\s*)?[0-9０-９]{1,3}\s*[.、．)）]\s*\S/.test(line)) n++;
  }
  return n;
}

function aiFileKind(piece) {
  return piece && piece.kind === 'exam' ? 'exam' : 'note';
}

// 自动判断文件类型：题号 + 选项行，或文件名/开头出现试卷类关键词
function aiGuessFileKind(text, name) {
  const s = String(text || '');
  const numbered = aiEstimateQuestions(s);
  const optionLines = (s.match(/(?:^|\n)\s*[A-DＡ-Ｄ][.、．)）]\s*\S/g) || []).length;
  const head = `${name || ''}\n${s.slice(0, 800)}`;
  const titleHit = /(试卷|真题|试题|模拟卷|模拟题|习题集|考试|期末|期中|答题卡|参考答案)/.test(head);
  if (numbered >= 3 && optionLines >= 3) return 'exam';
  if (titleHit && (numbered >= 2 || optionLines >= 2)) return 'exam';
  return 'note';
}

// 按文件类型分组收集资料：笔记用于出题，真题用于原样整理
function collectAIGroups() {
  const manual = (document.getElementById('aiMaterial')?.value || '').trim();
  const files = aiPieces.filter((p) => p.status === 'ok' && p.text);
  const hasFiles = files.length > 0;
  const pasteSelect = document.getElementById('aiPasteKind');
  const pasteKind = hasFiles
    ? (pasteSelect && pasteSelect.value === 'exam' ? 'exam' : 'note')
    : (aiMode === 'exam' ? 'exam' : 'note');

  const docs = files.map((p) => ({ name: p.name, kind: aiFileKind(p), material: p.text }));
  if (manual) docs.push({ name: '粘贴的文字', kind: pasteKind, material: manual });

  const noteDocs = docs.filter((doc) => doc.kind === 'note');
  const examDocs = docs.filter((doc) => doc.kind === 'exam');
  const join = (list) => list
    .map((doc) => (list.length > 1 ? `【${doc.name}】\n${doc.material}` : doc.material))
    .join('\n\n');

  const noteText = join(noteDocs);
  const examText = join(examDocs);
  return {
    docs, noteDocs, examDocs, hasFiles, pasteKind,
    noteText, examText,
    hasNotes: noteDocs.length > 0,
    hasExams: examDocs.length > 0,
    mixed: noteDocs.length > 0 && examDocs.length > 0
  };
}

const AI_STEPS = ['资料来源', '保存位置', '处理方式'];
let aiStep = 1;

function aiRailHTML() {
  return `<div class="wiz-steps" role="list">
    ${AI_STEPS.map((label, i) => {
      const n = i + 1;
      const cls = n === aiStep ? 'is-current' : (n < aiStep ? 'is-done' : 'is-idle');
      const inner = n < aiStep
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`
        : String(n);
      const clickable = n < aiStep && !aiParseBusy;
      return `${i > 0 ? '<span class="wiz-gap" aria-hidden="true"></span>' : ''}
        <div role="listitem" class="wiz-step ${cls}"${clickable ? ` onclick="goAIStep(${n})"` : ''}${n === aiStep ? ' aria-current="step"' : ''}>
          <span class="wiz-step-num">${inner}</span>
          <span class="wiz-step-label">${label}</span>
        </div>`;
    }).join('')}
  </div>`;
}

// 每一层是否已经可以往下走：资料层要求解析完成且字数够，保存位置层要求目标练习科目确定
function aiDestReady() {
  if (aiDest === 'new') return !!nsField('aiNewSubjectName').trim();
  return !!subjectById(aiSubjectId);
}

function aiStepReady(n) {
  if (aiParseBusy) return false;
  const groups = collectAIGroups();
  const noteChars = aiVisibleChars(groups.noteText);
  const examChars = aiVisibleChars(groups.examText);
  const hasMaterial = (groups.hasNotes && noteChars >= 50) || (groups.hasExams && examChars >= 50);
  if (n === 1) return hasMaterial;
  if (n === 2) {
    if (!hasMaterial) return false;
    if (groups.noteText.length > 24000 || groups.examText.length > 48000) return false;
    return aiDestReady();
  }
  return hasMaterial && aiDestReady();
}

function renderAIRail() {
  const rail = document.getElementById('aiRail');
  if (rail) rail.innerHTML = aiRailHTML();
}

function syncAILayerState() {
  renderAIRail();
  const next = document.getElementById('aiNextBtn');
  if (next) next.disabled = !aiStepReady(aiStep);
  if (aiStep === 3) renderAIReview();
}

function renderAIFooter() {
  const foot = document.getElementById('aiModalFooter');
  if (!foot) return;
  if (aiStep === 1) {
    foot.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">取消</button>
      <span style="flex:1"></span>
      <button class="btn btn-primary" id="aiNextBtn" onclick="goAIStep(2)"${aiStepReady(1) ? '' : ' disabled'}>下一步：保存位置 ${ICON.arrow}</button>`;
    return;
  }
  if (aiStep === 2) {
    foot.innerHTML = `<button class="btn btn-ghost btn-sm" onclick="goAIStep(1)">← 资料来源</button>
      <span style="flex:1"></span>
      <button class="btn btn-primary" id="aiNextBtn" onclick="goAIStep(3)"${aiStepReady(2) ? '' : ' disabled'}>下一步：处理方式 ${ICON.arrow}</button>`;
    return;
  }
  foot.innerHTML = `<button class="btn btn-ghost btn-sm" onclick="goAIStep(2)">← 保存位置</button>
    <span style="flex:1"></span>
    <button class="btn btn-primary" id="aiGenerateBtn" onclick="generateQuestions()">生成题目</button>`;
}

function showAILayer() {
  [1, 2, 3].forEach((n) => {
    const el = document.getElementById(`aiLayer${n}`);
    if (el) el.hidden = n !== aiStep;
  });
  renderAIRail();
  renderAIFooter();
  if (aiStep === 3) renderAIReview();
}

// 保存位置这一步在往下走时才真正落地：选「新增练习科目」就先建好，
// 并把这一轮刚上传、还挂在旧练习科目下的资料挪过来。
function commitAISubject() {
  if (aiDest !== 'new') return true;
  const input = document.getElementById('aiNewSubjectName');
  const name = (input ? input.value : '').trim();
  if (!name) {
    toast('先填上练习科目名称', 'info');
    input?.focus();
    return false;
  }
  const subject = createSubject(name, {
    examName: nsField('aiNewExamName').trim(),
    examDate: nsField('aiNewExamDate').trim()
  });
  if (!subject) { input?.focus(); return false; }
  aiSubjectId = subject.id;
  aiDest = 'existing';
  const moved = aiPieces.filter((p) => p.sessionStored && p.materialId);
  moved.forEach((p) => moveMaterialMeta(p.materialId, subject.id));
  const select = document.getElementById('aiSubjectSelect');
  if (select) select.innerHTML = renderAISubjectOptions();
  if (input) input.value = '';
  renderAILibrary();
  renderAIFileList();
  return true;
}

function goAIStep(target) {
  if (aiParseBusy) { toast('资料还在解析中，请稍候', 'info'); return; }
  if (target > aiStep && !aiStepReady(aiStep)) {
    toast(aiStep === 1 ? '先上传或粘贴至少 50 字的资料' : '目标练习科目还没定，请选一个练习科目或填新练习科目名称', 'info');
    return;
  }
  if (target > 2 && aiStep === 2 && !commitAISubject()) return;
  aiStep = Math.max(1, Math.min(3, target));
  showAILayer();
  refreshAIState();
}

function renderAIReview() {
  const box = document.getElementById('aiReviewSummary');
  if (!box) return;
  const groups = collectAIGroups();
  const subject = subjectById(aiSubjectId) || INBOX_SUBJECT;
  const noteChars = aiVisibleChars(groups.noteText);
  const examChars = aiVisibleChars(groups.examText);
  const range = document.getElementById('aiCount');
  const count = groups.hasNotes ? (parseInt(range?.value, 10) || 0) : 0;
  const examEst = groups.hasExams ? aiEstimateQuestions(groups.examText) : 0;
  const bits = [`<span class="wiz-chip">保存到 <b data-no-i18n>${esc(subject.name)}</b></span>`];
  if (groups.hasNotes) bits.push(`<span class="wiz-chip">笔记 <b>${groups.noteDocs.length}</b> 份 · ${noteChars.toLocaleString('zh-CN')} 字</span>`);
  if (groups.hasExams) bits.push(`<span class="wiz-chip">真题 <b>${groups.examDocs.length}</b> 份 · ${examChars.toLocaleString('zh-CN')} 字</span>`);
  if (groups.hasNotes) bits.push(`<span class="wiz-chip is-soft">将生成 <b>${count}</b> 题</span>`);
  if (groups.hasExams) bits.push(`<span class="wiz-chip is-soft">真题<b>原样保留</b>${examEst ? ` 约 ${examEst} 题` : ''}</span>`);
  if (aiFocus && aiMode !== 'exam') {
    const focus = aiFocusText();
    if (focus) bits.push(`<span class="wiz-chip is-soft">聚焦考点 <b>${esc(focus)}</b></span>`);
  }
  const pasteOnly = !groups.hasFiles && (groups.hasNotes || groups.hasExams);
  if (pasteOnly) bits.push('<span class="wiz-chip is-soft">来源：粘贴文字</span>');
  box.innerHTML = bits.join('');
  const title = document.getElementById('aiReviewTitle');
  if (title) {
    title.textContent = groups.mixed
      ? '笔记出题 + 真题整理'
      : (groups.hasExams ? '原样整理真题' : (aiFocus ? '围绕一个考点出题' : '根据资料出题'));
  }
}

function openAIModal(subjectId, materialIds) {
  const target = subjectById(subjectId);
  if (target) aiSubjectId = target.id;
  else if (!subjectById(aiSubjectId)) aiSubjectId = 'sub-inbox';
  // 解析进行中重新打开时保留文件，避免丢失刚上传的资料
  if (!aiParseBusy) {
    aiPieces = [];
    aiLastRecommended = 0;
  }
  aiDest = 'existing';
  // 从备考规划带考点跳过来时，默认就聚焦这个考点
  aiFocus = !!captureFocusLink();
  aiStep = 1;
  if (Array.isArray(materialIds) && materialIds.length) {
    addMaterialsToAI(materialIds);
    aiStep = 3;
  }
  openModal(`
    <div class="modal-header">
      <div class="modal-title">AI 出题 · 真题整理</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div id="aiRail">${aiRailHTML()}</div>
      <div id="aiFormWrap">
        ${renderPlanLinkNote()}
        <div id="aiErrorBox" class="feedback feedback-incorrect" hidden style="margin-bottom:14px"></div>

        <section class="wiz-layer" id="aiLayer1"${aiStep === 1 ? '' : ' hidden'}>
          <div class="wiz-head">
            <span class="wiz-title">资料来源</span>
            <span class="wiz-hint">上传文件 · 已有资料 · 粘贴文字</span>
          </div>
          <p class="wiz-note wiz-note-first">PDF / Word / PPT / TXT 都可以，笔记和真题能一起传。</p>
          <div class="ai-library" id="aiLibrary"></div>

          <label class="ai-dropzone" id="aiDropzone" for="aiFileInput" style="margin-top:12px">
            <input type="file" id="aiFileInput" multiple hidden
              accept=".pdf,.docx,.doc,.pptx,.txt,.md,.markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
              onchange="handleAIFileInput(this)">
            <span class="ai-dropzone-icon">${ICON.upload}</span>
            <span class="ai-dropzone-title">拖入文件，或点击选择</span>
            <span class="ai-dropzone-hint">支持多选 · 笔记和真题可以一起传 · 单文件 ≤ 30MB · 扫描版 PDF 需先 OCR</span>
          </label>
          <div class="ai-file-list" id="aiFileList"></div>
          <div class="ai-file-summary" id="aiFileSummary"></div>
          <button type="button" class="ai-paste-toggle" id="aiPasteToggle" onclick="toggleAIPaste()">没有文件？直接粘贴文字</button>
          <div id="aiPasteWrap" hidden>
            <div class="ai-paste-kind" id="aiPasteKindWrap" hidden>
              <span>这段文字属于</span>
              <select id="aiPasteKind" onchange="refreshAIState()">
                <option value="note">笔记 · 生成新题</option>
                <option value="exam">真题 · 原样整理</option>
              </select>
            </div>
            <textarea class="form-textarea" id="aiMaterial" style="margin-top:10px;min-height:120px" placeholder="粘贴课堂笔记、教材段落、真题试卷……" oninput="refreshAIState()"></textarea>
            <p class="text-sm text-muted" style="margin:5px 0 0">粘贴的文字会和上传的资料一起使用。</p>
          </div>
        </section>

        <section class="wiz-layer" id="aiLayer2"${aiStep === 2 ? '' : ' hidden'}>
          <div class="wiz-head">
            <span class="wiz-title">保存位置</span>
            <span class="wiz-hint">练习集和这一轮的资料都归到这里</span>
          </div>
          <div class="ai-mode" role="group" aria-label="保存位置">
            <button type="button" class="ai-mode-btn${aiDest === 'existing' ? ' active' : ''}" data-dest="existing" onclick="setAIDest('existing')">
              <span class="ai-mode-title">已有练习科目</span>
              <span class="ai-mode-desc">选一个练习科目</span>
            </button>
            <button type="button" class="ai-mode-btn${aiDest === 'new' ? ' active' : ''}" data-dest="new" onclick="setAIDest('new')">
              <span class="ai-mode-title">新增练习科目</span>
              <span class="ai-mode-desc">建一个新的练习科目</span>
            </button>
          </div>

          <div id="aiDestExisting"${aiDest === 'new' ? ' hidden' : ''}>
            <div class="wiz-field" style="margin-top:16px">
              <label class="form-label" for="aiSubjectSelect">保存到</label>
              <select class="form-select" id="aiSubjectSelect" onchange="onAISubjectChange(this.value)">${renderAISubjectOptions()}</select>
              <span class="wiz-help" id="aiDestHelp">—</span>
            </div>
          </div>

          <div id="aiDestNew"${aiDest === 'new' ? '' : ' hidden'}>
            <div class="wiz-grid" style="margin-top:16px">
              <div class="wiz-field wiz-span">
                <label class="form-label" for="aiNewSubjectName">练习科目名称</label>
                <input class="form-input" id="aiNewSubjectName" maxlength="40" placeholder="例如：导游业务、考研英语" oninput="syncAILayerState()">
                <span class="wiz-help">点「下一步」时创建，不会重复建同名练习科目。</span>
              </div>
              <div class="wiz-field">
                <label class="form-label" for="aiNewExamName">目标考试</label>
                <input class="form-input" id="aiNewExamName" maxlength="100" placeholder="选填">
              </div>
              <div class="wiz-field">
                <label class="form-label" for="aiNewExamDate">考试日期</label>
                <input class="form-input" type="date" id="aiNewExamDate">
              </div>
            </div>
            <p class="wiz-note">备考目标、每日题量可以在练习科目页的「编辑」里补全。</p>
          </div>
        </section>

        <section class="wiz-layer" id="aiLayer3"${aiStep === 3 ? '' : ' hidden'}>
          <div class="wiz-head">
            <span class="wiz-title">处理方式</span>
            <span class="wiz-hint">出题 · 原样整理 · 聚焦考点</span>
          </div>
          <div class="ai-mode" id="aiModeGroup" role="group" aria-label="出题方式">
            <button type="button" class="ai-mode-btn active" data-mode="generate" onclick="setAIMode('generate')">
              <span class="ai-mode-title">根据资料出题</span>
              <span class="ai-mode-desc">笔记、教材 → 生成新题</span>
            </button>
            <button type="button" class="ai-mode-btn" data-mode="exam" onclick="setAIMode('exam')">
              <span class="ai-mode-title">原样整理真题</span>
              <span class="ai-mode-desc">试卷、练习集 → 全部保留</span>
            </button>
          </div>
          <div class="ai-group-summary" id="aiGroupSummary" hidden></div>
          <button type="button" class="ai-mode-hint" id="aiModeHint" hidden onclick="setAIMode('exam')">检测到试卷格式，点这里改为原样整理，题目全部保留 →</button>

          <div class="ai-focus-card" id="aiFocusCard">
            <label class="ai-focus-toggle">
              <input type="checkbox" id="aiFocusOn" onchange="toggleAIFocus(this.checked)">
              <span class="ai-focus-title">聚焦考点</span>
            </label>
            <span class="ai-mode-desc" id="aiFocusDesc">只围绕一个考点出题，其它内容少出或不出题。</span>
            <input class="form-input" id="aiFocusTopic" maxlength="400" placeholder="例如：导游语言技巧、定语从句" oninput="refreshAIState()" hidden>
          </div>

          <div class="ai-count-card" id="aiCountCard">
            <div class="ai-count-head">
              <span class="ai-count-label">题目数量</span>
              <span class="ai-count-value" id="aiCountValue">—</span>
            </div>
            <input type="range" class="ai-range" id="aiCount" min="3" max="40" value="8" step="1" disabled oninput="onAICountInput()">
            <div class="ai-count-hint" id="aiCountHint">上传资料后，会按资料篇幅自动推荐题量</div>
          </div>
          <div id="aiTypesWrap">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">题型偏好</label>
              <select class="form-select" id="aiTypes" onchange="onAITypesChange()">
                <option value="mixed" selected>混合题型</option>
                <option value="choice">仅选择题</option>
                <option value="with-code">含编程题</option>
              </select>
            </div>
            <div class="form-group" id="aiCodeLangGroup" style="display:none;margin:12px 0 0">
              <label class="form-label">编程题语言</label>
              <select class="form-select" id="aiCodeLang">
                <option value="python" selected>Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <p class="text-sm text-muted" style="margin:8px 0 0">混合题型包含单选、多选、判断、填空；只有编程类资料才需要选择「含编程题」。</p>
          </div>
          <div class="ai-exam-note" id="aiExamNote" hidden>
            <b id="aiExamEstimate">将全部整理</b>
            <span id="aiExamNoteText">题干、选项和答案按原文保留，不改写、不删减；原文没有答案时会给出参考答案。</span>
          </div>

          <div class="ai-review">
            <div class="ai-note">
              <span class="ai-note-dot"></span>
              <span id="aiReviewTitle">根据资料出题</span>
            </div>
            <div class="wiz-summary" id="aiReviewSummary"></div>
          </div>
          <details class="ai-preview" id="aiPreview" hidden>
            <summary>查看提取的文字<span id="aiPreviewCount"></span></summary>
            <pre id="aiPreviewText"></pre>
          </details>
        </section>
      </div>
      <div id="aiRunWrap" hidden></div>
    </div>
    <div class="modal-footer" id="aiModalFooter"></div>`, 'modal-wide');
  bindAIDropzone();
  setAIMode(aiMode);
  renderAIFileList();
  renderAILibrary();
  showAILayer();
  refreshAIState();
}

function renderAISubjectOptions() {
  const list = [...allSubjects(), INBOX_SUBJECT];
  return list.map((s) => `<option value="${s.id}" ${s.id === aiSubjectId ? 'selected' : ''} data-no-i18n>${esc(s.name)}</option>`).join('');
}

function addMaterialsToAI(ids) {
  const wanted = new Set(ids);
  materials.filter((m) => wanted.has(m.id)).forEach((m) => {
    if (aiPieces.some((p) => p.materialId === m.id || (p.name === m.name && p.size === m.size))) return;
    aiPieces.push({
      id: 'm' + m.id,
      materialId: m.id,
      fromMaterial: true,
      name: m.name,
      size: m.size,
      ext: m.ext,
      kind: m.kind,
      status: 'ok',
      chars: m.chars,
      pages: m.pages,
      text: m.text,
      savedTo: m.subjectId,
      file: null
    });
  });
}

function renderAILibrary() {
  const wrap = document.getElementById('aiLibrary');
  if (!wrap) return;
  const subject = subjectById(aiSubjectId) || INBOX_SUBJECT;
  const list = subjectMaterials(subject.id);
  if (!list.length) {
    wrap.hidden = true;
    wrap.innerHTML = '';
    return;
  }
  wrap.hidden = false;
  wrap.innerHTML = `
    <div class="ai-library-head">
      <span>「${esc(subject.name)}」已有资料</span>
      <span class="text-sm text-muted">勾选后直接参与出题</span>
    </div>
    <div class="ai-library-list">
      ${list.map((m) => {
        const checked = aiPieces.some((p) => p.materialId === m.id);
        return `<label class="ai-library-item${checked ? ' checked' : ''}">
          <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleLibraryMaterial('${m.id}', this.checked)">
          <span class="ai-library-main">
            <span class="ai-library-name" data-no-i18n>${esc(m.name)}</span>
            <span class="ai-library-meta">${materialKindLabel(m.kind)} · ${m.chars.toLocaleString('zh-CN')} 字</span>
          </span>
        </label>`;
      }).join('')}
    </div>`;
}

function toggleLibraryMaterial(id, checked) {
  if (checked) addMaterialsToAI([id]);
  else aiPieces = aiPieces.filter((p) => p.materialId !== id);
  renderAILibrary();
  renderAIFileList();
  refreshAIState();
}

function onAISubjectChange(value) {
  const subject = subjectById(value);
  if (!subject) return;
  aiSubjectId = subject.id;
  // 换练习科目时只移除来自旧练习科目资料库的条目，本次上传的文件保留
  aiPieces = aiPieces.filter((p) => !p.fromMaterial);
  renderAILibrary();
  renderAIFileList();
  refreshAIState();
}

function setAIDest(kind) {
  aiDest = kind === 'new' ? 'new' : 'existing';
  document.querySelectorAll('[data-dest]').forEach((b) => {
    const on = b.dataset.dest === aiDest;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const existing = document.getElementById('aiDestExisting');
  const fresh = document.getElementById('aiDestNew');
  if (existing) existing.hidden = aiDest !== 'existing';
  if (fresh) {
    fresh.hidden = aiDest !== 'new';
    if (aiDest === 'new') document.getElementById('aiNewSubjectName')?.focus();
  }
  syncAILayerState();
}

function toggleAIFocus(on) {
  aiFocus = !!on && aiMode !== 'exam';
  const box = document.getElementById('aiFocusOn');
  if (box) box.checked = aiFocus;
  refreshAIState();
}

// 去掉控制字符，考点名最长按联动协议的 topic 上限处理
function cleanFocusText(v) {
  return String(v || '').replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, PLAN_PARAM_LIMITS.topic);
}

// 聚焦考点的文字：备考规划带过来的考点优先，其次才是手填的
function aiFocusText() {
  const link = captureFocusLink();
  if (link) return link.topic;
  return cleanFocusText(nsField('aiFocusTopic'));
}

// 上传解析成功后自动归档到当前练习科目：同名同大小视为已有
async function autoStoreAIPiece(piece) {
  if (!piece || piece.fromMaterial || !piece.text || materialsUnavailable) return;
  const subjectId = aiSubjectId || 'sub-inbox';
  const dup = materials.find((m) => m.subjectId === subjectId && m.name === piece.name && m.size === piece.size);
  if (dup) {
    piece.materialId = dup.id;
    piece.savedTo = subjectId;
    return;
  }
  const record = {
    id: 'mat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    subjectId,
    name: String(piece.name || '未命名资料').slice(0, 160),
    size: piece.size || 0,
    ext: piece.ext || '',
    kind: aiFileKind(piece),
    pages: piece.pages || 0,
    chars: piece.chars || aiVisibleChars(piece.text),
    addedAt: Date.now(),
    text: piece.text
  };
  try {
    const blob = piece.file && piece.file.size <= MATERIAL_BLOB_LIMIT ? piece.file : null;
    const saved = await saveMaterialRecord(record, blob);
    materials.unshift(saved);
    piece.materialId = saved.id;
    piece.savedTo = subjectId;
    // 这一轮新建的资料：之后如果「保存位置」改成新练习科目，就把它挪过去
    piece.sessionStored = true;
  } catch (e) {
    // 资料库写入失败不阻断出题，只是这次文件不会留档
    piece.saveFailed = true;
    console.warn('[StarQuiz] 资料归档失败', e);
  }
}

function bindAIDropzone() {
  const dz = document.getElementById('aiDropzone');
  if (!dz) return;
  let depth = 0;
  dz.addEventListener('dragenter', (e) => {
    e.preventDefault();
    depth++;
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragover', (e) => e.preventDefault());
  dz.addEventListener('dragleave', (e) => {
    e.preventDefault();
    depth = Math.max(0, depth - 1);
    if (!depth) dz.classList.remove('dragover');
  });
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    depth = 0;
    dz.classList.remove('dragover');
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) handleAIFiles(files);
  });
}

function toggleAIPaste() {
  const wrap = document.getElementById('aiPasteWrap');
  const btn = document.getElementById('aiPasteToggle');
  if (!wrap || !btn) return;
  const show = wrap.hidden;
  wrap.hidden = !show;
  btn.textContent = show ? '收起粘贴框' : '没有文件？直接粘贴文字';
  if (show) document.getElementById('aiMaterial')?.focus();
}

function onAICountInput() {
  const range = document.getElementById('aiCount');
  if (!range) return;
  range.dataset.touched = '1';
  const valueEl = document.getElementById('aiCountValue');
  if (valueEl) valueEl.innerHTML = `${range.value}<small>题</small>`;
}

function setAIMode(mode) {
  aiMode = mode === 'exam' ? 'exam' : 'generate';
  if (aiMode === 'exam') aiFocus = false;
  document.querySelectorAll('.ai-mode-btn[data-mode]').forEach((b) => {
    const on = b.dataset.mode === aiMode;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  refreshAIState();
}

function refreshAIState() {
  const range = document.getElementById('aiCount');
  const valueEl = document.getElementById('aiCountValue');
  const hintEl = document.getElementById('aiCountHint');
  if (!range || !valueEl || !hintEl) return;

  const groups = collectAIGroups();
  const { hasFiles, hasNotes, hasExams, mixed } = groups;
  const noteChars = aiVisibleChars(groups.noteText);
  const examChars = aiVisibleChars(groups.examText);
  const noteOversize = groups.noteText.length > 24000;
  const examOversize = groups.examText.length > 48000;
  const ready = (hasNotes || hasExams)
    && (!hasNotes || noteChars >= 50)
    && (!hasExams || examChars >= 50);

  const modeGroup = document.getElementById('aiModeGroup');
  if (modeGroup) modeGroup.hidden = hasFiles;
  const pasteKindWrap = document.getElementById('aiPasteKindWrap');
  if (pasteKindWrap) pasteKindWrap.hidden = !hasFiles;

  // 保存位置这一层的上下文：目标练习科目现在有什么
  const destSubject = subjectById(aiSubjectId) || INBOX_SUBJECT;
  const destHelp = document.getElementById('aiDestHelp');
  if (destHelp) {
    const destSets = subjectSets(destSubject.id).length;
    const destMats = subjectMaterials(destSubject.id).length;
    destHelp.textContent = destSets || destMats
      ? `「${destSubject.name}」已有 ${destSets} 个练习集 · ${destMats} 份资料`
      : `「${destSubject.name}」还是空的，出题后会出现在这里`;
  }

  // 聚焦考点：真题整理是原样保留，不能同时只练一个考点
  const focusCard = document.getElementById('aiFocusCard');
  const focusBox = document.getElementById('aiFocusOn');
  const focusInput = document.getElementById('aiFocusTopic');
  const focusDesc = document.getElementById('aiFocusDesc');
  const link = captureFocusLink();
  if (focusCard) focusCard.classList.toggle('is-off', hasExams && !hasNotes);
  if (focusBox) {
    const focusOff = aiParseBusy || (hasExams && !hasNotes);
    if (focusOff) aiFocus = false;
    focusBox.disabled = focusOff;
    focusBox.checked = aiFocus;
  }
  if (focusInput) {
    focusInput.hidden = !aiFocus;
    if (link) {
      focusInput.value = link.topic;
      focusInput.disabled = true;
    } else {
      focusInput.disabled = false;
    }
  }
  if (focusDesc) {
    focusDesc.textContent = link
      ? '这个练习集会标上备考规划的考点，练完可以把结果带回计划。'
      : '只围绕一个考点出题，其它内容少出或不出题。';
  }

  const countCard = document.getElementById('aiCountCard');
  const typesWrap = document.getElementById('aiTypesWrap');
  const examNote = document.getElementById('aiExamNote');
  if (countCard) countCard.hidden = !hasNotes;
  if (typesWrap) typesWrap.hidden = !hasNotes;
  if (examNote) examNote.hidden = !hasExams;

  if (hasNotes) {
    const { min, max, rec } = aiCountRange(noteChars);
    // 练习科目的「默认题量」优先于按篇幅推荐，但仍在资料能支撑的区间内
    const subj = subjectById(aiSubjectId);
    const pref = subj && subj.defaultCount ? Math.max(min, Math.min(max, subj.defaultCount)) : rec;
    range.min = String(min);
    range.max = String(max);
    range.disabled = !ready || noteOversize;
    if (noteChars >= 50) {
      const current = Number(range.value) || 0;
      if (!range.dataset.touched || current < min || current > max || current === aiLastRecommended) {
        range.value = String(pref);
      }
      aiLastRecommended = rec;
    } else {
      range.value = String(rec);
      aiLastRecommended = 0;
    }

    valueEl.innerHTML = noteChars >= 50 ? `${range.value}<small>题</small>` : '—';
    if (aiParseBusy && !noteChars) {
      hintEl.textContent = '正在解析资料…';
    } else if (noteOversize) {
      hintEl.textContent = `笔记资料 ${groups.noteText.length.toLocaleString()} 字，超过 24,000 字，请拆分后再上传`;
    } else if (noteChars < 50) {
      hintEl.textContent = '上传资料后，会按资料篇幅自动推荐题量';
    } else {
      const examTail = hasExams ? '；真题部分全部保留，不计入此数量' : '';
      const from = pref === rec ? `按篇幅建议 ${rec} 题` : `用练习科目默认 ${pref} 题（按篇幅建议 ${rec}）`;
      hintEl.textContent = `${noteChars.toLocaleString()} 字资料 · ${from}，可调 ${min}–${max}${examTail}`;
    }
  } else {
    range.disabled = true;
    valueEl.innerHTML = '—';
  }

  if (hasExams) {
    const est = examChars >= 50 ? aiEstimateQuestions(groups.examText) : 0;
    const estEl = document.getElementById('aiExamEstimate');
    if (estEl) {
      estEl.textContent = aiParseBusy && !examChars ? '正在解析资料…' : (!examChars ? '等待资料' : (est > 0 ? `识别到约 ${est} 道题` : '将全部整理'));
    }
    const noteText = document.getElementById('aiExamNoteText');
    if (noteText) {
      noteText.textContent = examOversize
        ? '真题资料超过 48,000 字，请拆分后再整理，避免漏题。'
        : mixed
          ? '真题部分按原文逐题保留；笔记部分另出新题。较长试卷会自动分段并行整理。'
          : '题干、选项和答案按原文保留，不改写、不删减；较长试卷会自动分段并行整理，速度更快。';
    }
    if (examNote) examNote.classList.toggle('is-warn', examOversize);
  }

  const summary = document.getElementById('aiGroupSummary');
  if (summary) {
    if (!hasFiles || !(hasNotes || hasExams)) {
      summary.hidden = true;
      summary.innerHTML = '';
    } else {
      summary.hidden = false;
      const bits = [];
      if (hasNotes) bits.push(`<span class="ai-group-pill note">笔记 ${groups.noteDocs.length} 份 · 生成新题</span>`);
      if (hasExams) bits.push(`<span class="ai-group-pill exam">真题 ${groups.examDocs.length} 份 · 原样保留</span>`);
      summary.innerHTML = `<div class="ai-group-pills">${bits.join('')}</div>
        <div class="ai-group-actions">
          <button type="button" onclick="setAllAIFileKinds('note')">全部按笔记</button>
          <button type="button" onclick="setAllAIFileKinds('exam')">全部按真题</button>
          <span>点文件名右侧的标签可单独切换</span>
        </div>`;
    }
  }

  const modeHint = document.getElementById('aiModeHint');
  if (modeHint) {
    const pasteText = `${groups.noteText}\n${groups.examText}`;
    const optionLines = (pasteText.match(/(?:^|\n)\s*[A-DＡ-Ｄ][.、．)）]\s*/g) || []).length;
    modeHint.hidden = hasFiles || aiMode === 'exam' || !ready
      || aiEstimateQuestions(pasteText) < 5 || optionLines < 3;
  }

  const preview = document.getElementById('aiPreview');
  const previewText = document.getElementById('aiPreviewText');
  const previewCount = document.getElementById('aiPreviewCount');
  if (preview && previewText) {
    const previewBody = mixed
      ? `【笔记】\n${groups.noteText}\n\n【真题】\n${groups.examText}`
      : (groups.examText || groups.noteText);
    preview.hidden = !ready;
    if (ready) {
      previewText.textContent = previewBody.slice(0, 48000);
      if (previewCount) previewCount.textContent = `（${(noteChars + examChars).toLocaleString()} 字）`;
    }
  }

  const oversize = noteOversize || examOversize;
  const btn = document.getElementById('aiGenerateBtn');
  if (btn) {
    btn.disabled = !ready || aiParseBusy || oversize;
    btn.textContent = mixed
      ? (oversize ? '资料超长，请拆分' : '开始整理')
      : hasExams
        ? (examOversize ? '请先拆分资料' : '整理全部真题')
        : '生成题目';
  }
  syncAILayerState();
}

function renderAIFileList() {
  const list = document.getElementById('aiFileList');
  if (list) {
    list.innerHTML = aiPieces.map((p) => {
      const kind = p.ext === 'md' || p.ext === 'markdown' ? 'txt' : (['pdf', 'docx', 'doc', 'pptx', 'txt'].includes(p.ext) ? p.ext : 'txt');
      const label = p.ext === 'markdown' ? 'MD' : String(p.ext || 'FILE').toUpperCase().slice(0, 4);
      let meta;
      if (p.status === 'parsing') {
        meta = `<span class="spinner" style="width:11px;height:11px;border-width:2px;display:inline-block;vertical-align:-1px"></span> 正在解析…`;
      } else if (p.status === 'error') {
        meta = `<span class="file-err">✕ ${esc(p.error || '解析失败')}</span>`;
      } else {
        const bits = [];
        if (p.pages) bits.push(`${p.pages} 页`);
        bits.push(`${p.chars.toLocaleString()} 字`);
        if (p.materialId) bits.push(`已存入${esc((subjectById(p.savedTo) || INBOX_SUBJECT).name)}`);
        else if (p.saveFailed) bits.push('未留档');
        meta = `${bits.join(' · ')} · <span class="file-ok">✓ 已提取</span>`;
      }
      const kindTag = p.status === 'ok'
        ? `<button type="button" class="ai-file-kind ${aiFileKind(p)}" title="点击切换：笔记生成新题 / 真题原样保留" onclick="toggleAIFileKind('${p.id}')">${aiFileKind(p) === 'exam' ? '真题 · 保留' : '笔记 · 出题'}</button>`
        : '';
      return `<div class="ai-file">
        <span class="ai-file-type ${kind}">${esc(label)}</span>
        <div class="ai-file-main">
          <div class="ai-file-name" data-no-i18n title="${esc(p.name)}">${esc(p.name)}</div>
          <div class="ai-file-meta">${meta}</div>
        </div>
        ${kindTag}
        <button type="button" class="ai-file-remove" aria-label="移除 ${esc(p.name)}" onclick="removeAIFile('${p.id}')">×</button>
      </div>`;
    }).join('');
  }
  renderAIFileSummary();
}

function renderAIFileSummary() {
  const el = document.getElementById('aiFileSummary');
  if (!el) return;
  const ok = aiPieces.filter((p) => p.status === 'ok');
  const failed = aiPieces.filter((p) => p.status === 'error');
  const parsing = aiPieces.filter((p) => p.status === 'parsing');
  const parts = [];
  const aggregate = ok.length > 1 || parsing.length > 0 || failed.length > 0;
  if (ok.length && aggregate) {
    const pages = ok.reduce((n, p) => n + (p.pages || 0), 0);
    const chars = ok.reduce((n, p) => n + p.chars, 0);
    const notes = ok.filter((p) => aiFileKind(p) === 'note').length;
    const exams = ok.length - notes;
    const kindText = ok.length > 1
      ? ` · ${notes ? `笔记 ${notes} 份` : ''}${notes && exams ? '、' : ''}${exams ? `真题 ${exams} 份` : ''}`
      : '';
    parts.push(`<span class="file-ok">✓ 已提取 ${ok.length} 个文件${pages ? ` · ${pages} 页` : ''} · ${chars.toLocaleString()} 字${kindText}</span>`);
  }
  if (parsing.length) parts.push(`正在解析 ${parsing.length} 个文件…`);
  if (failed.length) parts.push(`<span class="file-err">${failed.length} 个文件解析失败</span>`);
  el.innerHTML = parts.join(' · ');
}

function toggleAIFileKind(id) {
  const piece = aiPieces.find((p) => p.id === id);
  if (!piece || piece.status !== 'ok') return;
  piece.kind = aiFileKind(piece) === 'exam' ? 'note' : 'exam';
  piece.kindTouched = true;
  renderAIFileList();
  refreshAIState();
}

function setAllAIFileKinds(kind) {
  const target = kind === 'exam' ? 'exam' : 'note';
  aiPieces.forEach((piece) => {
    if (piece.status !== 'ok') return;
    piece.kind = target;
    piece.kindTouched = true;
  });
  renderAIFileList();
  refreshAIState();
}

function removeAIFile(id) {
  aiPieces = aiPieces.filter((p) => p.id !== id);
  renderAIFileList();
  renderAILibrary();
  refreshAIState();
}

function onAITypesChange() {
  const types = document.getElementById('aiTypes');
  const group = document.getElementById('aiCodeLangGroup');
  if (types && group) group.style.display = types.value === 'with-code' ? '' : 'none';
}

const MATERIAL_LIMIT = 24000;
const scriptCache = {};
let pdfjsPromise = null;

function loadScript(src) {
  if (scriptCache[src]) return scriptCache[src];
  scriptCache[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => { delete scriptCache[src]; reject(new Error('解析组件加载失败，请检查网络后重试')); };
    document.head.appendChild(s);
  });
  return scriptCache[src];
}

function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('./vendor/pdf.min.mjs').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.mjs', document.baseURI).href;
      return lib;
    }).catch((e) => { pdfjsPromise = null; throw e; });
  }
  return pdfjsPromise;
}

const PDF_PAGE_CAP = 300;

let pdfLayoutPromise = null;

function loadPdfLayout() {
  if (!pdfLayoutPromise) {
    pdfLayoutPromise = import('./pdf-layout.js?v=52').catch((e) => {
      pdfLayoutPromise = null;
      throw e;
    });
  }
  return pdfLayoutPromise;
}

async function parsePDF(file) {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: new URL('vendor/cmaps/', document.baseURI).href,
    cMapPacked: true,
    isEvalSupported: false
  }).promise;
  const pageCount = doc.numPages;
  const pages = Math.min(pageCount, PDF_PAGE_CAP);
  const pageLines = [];
  let emptyPages = 0;
  let collected = 0;

  const layout = await loadPdfLayout();

  for (let i = 1; i <= pages; i++) {
    let lines = [];
    try {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      // 版面还原：识别双栏 gutter，按栏的阅读顺序输出；行内保留表格的列结构
      lines = layout.layoutPage(content.items, viewport.width, viewport.height);
    } catch {
      emptyPages++;
      continue;
    }

    const pageText = lines.join('\n').trim();
    if (pageText) {
      pageLines.push(lines);
      collected += pageText.length;
    } else {
      emptyPages++;
    }
    if (collected > MATERIAL_LIMIT * 4) break;
  }

  await doc.destroy().catch(() => {});

  // 只统计正文行，空行是段落间隔，不算“被过滤”
  const countBodyLines = (list) => list.reduce((n, lines) => n + lines.filter((line) => line.trim()).length, 0);
  const beforeLines = countBodyLines(pageLines);
  // 去掉每页重复出现的页眉页脚、纯页码行（扫描件没有文字层，不在这里处理）
  const cleaned = layout.dropRunningLines(pageLines);
  const afterLines = countBodyLines(cleaned);
  const removed = Math.max(0, beforeLines - afterLines);

  const text = cleaned.map((lines) => lines.join('\n')).filter((chunk) => chunk.trim()).join('\n\n');
  if (text.replace(/\s/g, '').length < 30) {
    throw new Error('这份 PDF 没有可提取的文字层，可能是扫描件或图片版；请上传可复制文字的 PDF，或直接上传 Word/TXT');
  }
  const filtered = removed > 0 ? ` · 过滤 ${removed} 行页眉页脚` : '';
  const note = emptyPages > 0 ? `，${emptyPages} 页无文字层已跳过` : '';
  return { text, meta: `${pageCount} 页${filtered}${note}` };
}

// Word 转 HTML 后按文档顺序取段落；表格按行拼接，保留"项目 | 数值"这类结构
const DOCX_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DT', 'DD']);

function docxHtmlToText(html) {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const blocks = [];
  const push = (raw) => {
    const t = String(raw || '').replace(/[ \t\u00a0]+/g, ' ').trim();
    if (t) blocks.push(t);
  };
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toUpperCase();
    if (tag === 'TABLE') {
      const rows = [];
      for (const tr of node.querySelectorAll('tr')) {
        const cells = [];
        for (const cell of tr.children) {
          const t = String(cell.textContent || '').replace(/\s+/g, ' ').trim();
          if (t) cells.push(t);
        }
        if (cells.length) rows.push(cells.join(' | '));
      }
      if (rows.length) push(rows.join('\n'));
      return '';
    }
    if (DOCX_BLOCK_TAGS.has(tag)) {
      push(node.textContent);
      return '';
    }
    let out = '';
    for (const child of node.childNodes) out += walk(child);
    return out;
  };
  for (const child of dom.body.childNodes) {
    const leftover = walk(child);
    if (leftover.trim()) push(leftover);
  }
  return blocks.join('\n\n');
}

async function parseDOCX(file) {
  await loadScript('vendor/mammoth.browser.min.js');
  if (!window.mammoth) throw new Error('Word 解析组件加载失败');
  const arrayBuffer = await file.arrayBuffer();
  const head = new Uint8Array(arrayBuffer.slice(0, 2));
  if (head[0] !== 0x50 || head[1] !== 0x4b) {
    throw new Error('这个文件不是标准的 .docx 格式（可能只是改了扩展名），请用 Word/WPS 另存为 .docx 后上传');
  }
  let text = '';
  try {
    const result = await window.mammoth.convertToHtml({ arrayBuffer });
    text = docxHtmlToText(result.value || '');
  } catch {
    text = '';
  }
  // 结构化解析失败或几乎没内容时，退回纯文本提取兜底
  if (text.replace(/\s/g, '').length < 30) {
    try {
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      const raw = String(result.value || '').trim();
      if (raw.length > text.length) text = raw;
    } catch {
      // 两种方式都失败时保留已有文本，交给上层提示
    }
  }
  return { text, meta: '' };
}

let docTextPromise = null;
function loadDocText() {
  if (!docTextPromise) {
    docTextPromise = import('./doc-text.js?v=53').catch((e) => {
      docTextPromise = null;
      throw e;
    });
  }
  return docTextPromise;
}

function looksLikeOle(bytes) {
  return !!bytes && bytes.length >= 8 &&
    bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1;
}

async function parseLegacyDOC(file) {
  const mod = await loadDocText();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = '';
  try {
    text = mod.extractLegacyWordText(bytes);
  } catch (e) {
    const code = e && e.message;
    if (code === 'encrypted_doc') {
      throw new Error('这份 Word 文档设置了密码保护，暂时无法读取；请取消密码后另存为 .docx 再上传');
    }
    if (code === 'not_word97') {
      throw new Error('这份文档是更早的 Word 95 格式，请用 Word/WPS 另存为 .docx 后上传');
    }
    throw new Error('旧版 Word 文档解析失败，请用 Word/WPS 另存为 .docx 后上传');
  }
  if (text.replace(/\s/g, '').length < 30) {
    throw new Error('这份旧版 Word 文档里没有可提取的文字，可能是扫描件或纯图片；请上传可复制文字的文档，或直接粘贴文字');
  }
  return { text, meta: '旧版 Word · 已自动识别' };
}

function pptNumber(name) {
  const m = /(\d+)\.xml$/.exec(name);
  return m ? parseInt(m[1], 10) : 0;
}

function pptXmlLines(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const nodes = doc.getElementsByTagName('a:t');
  const lines = [];
  for (const node of nodes) {
    const t = (node.textContent || '').trim();
    if (t) lines.push(t);
  }
  return lines;
}

// 通过 slide 的 rels 找到对应备注页（编号不一定和幻灯页码一致）
async function pptNotesLines(zip, index) {
  try {
    const relName = `ppt/slides/_rels/slide${index}.xml.rels`;
    const relFile = zip.file(relName);
    if (!relFile) return [];
    const relXml = await relFile.async('string');
    const m = /Target="([^"]*notesSlide\d+\.xml)"/.exec(relXml);
    if (!m) return [];
    let target = m[1];
    if (target.startsWith('/')) target = target.slice(1);
    else target = target.replace(/^\.\.\//, 'ppt/');
    const notesFile = zip.file(target) || zip.file(`ppt/${target}`);
    if (!notesFile) return [];
    const lines = pptXmlLines(await notesFile.async('string')).filter((t) => !/^\d{1,3}$/.test(t));
    return lines;
  } catch {
    return [];
  }
}

async function parsePPTX(file) {
  await loadScript('vendor/jszip.min.js');
  if (!window.JSZip) throw new Error('PPT 解析组件加载失败');
  const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => pptNumber(a) - pptNumber(b));
  if (!slides.length) throw new Error('没有在 PPT 中找到幻灯片内容');
  const chunks = [];
  for (const name of slides) {
    const index = pptNumber(name);
    const lines = pptXmlLines(await zip.file(name).async('string'));
    const notes = await pptNotesLines(zip, index);
    if (notes.length) {
      const clean = notes.join(' ').replace(/^备注[:：]\s*/, '').trim();
      if (clean) lines.push(`备注：${clean}`);
    }
    if (lines.length) chunks.push(lines.join('\n'));
  }
  // SmartArt 的文字不在 slide XML 里，单独从 diagrams 数据中补全
  const diagrams = Object.keys(zip.files)
    .filter((n) => /^ppt\/diagrams\/data\d+\.xml$/.test(n))
    .sort((a, b) => pptNumber(a) - pptNumber(b));
  const diagramChunks = [];
  for (const name of diagrams) {
    const lines = pptXmlLines(await zip.file(name).async('string'));
    if (lines.length) diagramChunks.push(lines.join('\n'));
  }
  if (diagramChunks.length) chunks.push(`图示内容：\n${diagramChunks.join('\n')}`);
  return { text: chunks.join('\n\n'), meta: `${slides.length} 页` };
}

// 文本文件编码兜底：UTF-16 BOM → 严格 UTF-8 → GB18030（兼容 GBK）
async function parseText(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.length >= 2) {
    if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf);
    if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder('utf-16be').decode(buf);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf).replace(/^\uFEFF/, '');
  } catch {
    // 不是合法 UTF-8
  }
  try {
    return new TextDecoder('gb18030').decode(buf);
  } catch {
    return new TextDecoder('utf-8').decode(buf);
  }
}

function detectMaterialExt(file) {
  const nameExt = (String(file.name || '').split('.').pop() || '').toLowerCase();
  if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'md', 'markdown'].includes(nameExt)) return nameExt;
  const mime = String(file.type || '').toLowerCase();
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('wordprocessingml')) return 'docx';
  if (mime === 'application/msword') return 'doc';
  if (mime.includes('presentationml')) return 'pptx';
  if (mime === 'application/vnd.ms-powerpoint') return 'ppt';
  if (mime.startsWith('text/') || mime.includes('markdown')) return 'txt';
  return nameExt;
}

async function extractMaterial(file) {
  const ext = detectMaterialExt(file);
  // 扩展名不可靠：WPS/老版 Office 常把 .doc 存成 .docx，先看文件头（OLE 复合文档）
  if (['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(ext)) {
    const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    if (looksLikeOle(head)) {
      if (ext === 'ppt' || ext === 'pptx') {
        throw new Error('这是旧版 PowerPoint（.ppt）文件，请用 PowerPoint/WPS 另存为 .pptx 后上传');
      }
      return parseLegacyDOC(file);
    }
  }
  if (ext === 'pdf') return parsePDF(file);
  if (ext === 'docx') return parseDOCX(file);
  if (ext === 'pptx') return parsePPTX(file);
  if (ext === 'doc') return parseLegacyDOC(file);
  if (ext === 'ppt') throw new Error('旧版 .ppt 暂不支持，请另存为 .pptx 后上传');
  if (['txt', 'md', 'markdown'].includes(ext)) return { text: await parseText(file), meta: '' };
  throw new Error('暂不支持该文件格式，请上传 PDF、Word（.docx/.doc）、PPT、TXT 或 Markdown');
}

async function handleAIFileInput(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  if (files.length) await handleAIFiles(files);
}

async function handleAIFiles(files) {
  const MAX_FILES = 8;
  for (const file of files) {
    if (aiPieces.length >= MAX_FILES) {
      toast(`最多一次添加 ${MAX_FILES} 个文件`, 'info');
      break;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast(`「${file.name}」超过 30MB，请拆分后再上传`, 'error');
      continue;
    }
    if (aiPieces.some((p) => p.name === file.name && p.size === file.size)) {
      toast(`「${file.name}」已在列表中`, 'info');
      continue;
    }
    const ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
    aiPieces.push({
      id: 'f' + (++aiSeq),
      name: file.name,
      size: file.size,
      ext,
      status: 'parsing',
      chars: 0,
      pages: 0,
      text: '',
      error: '',
      file
    });
  }
  renderAIFileList();
  await parseAIQueue();
}

async function parseAIQueue() {
  if (aiParseBusy) return;
  aiParseBusy = true;
  refreshAIState();
  try {
    for (;;) {
      const piece = aiPieces.find((p) => p.status === 'parsing' && p.file);
      if (!piece) break;
      try {
        const { text, meta } = await extractMaterial(piece.file);
        const clean = cleanMaterialText(text);
        const chars = aiVisibleChars(clean);
        if (chars < 50) throw new Error('几乎没有提取到文字，可能是扫描版文件，请先 OCR 或直接粘贴文字');
        piece.text = clean;
        piece.chars = chars;
        piece.meta = meta || '';
        const m = String(meta || '').match(/(\d+)/);
        piece.pages = m ? parseInt(m[1], 10) : 0;
        if (!piece.kindTouched) piece.kind = aiGuessFileKind(clean, piece.name);
        piece.status = 'ok';
        await autoStoreAIPiece(piece);
      } catch (e) {
        piece.status = 'error';
        piece.error = e && e.message ? e.message : '文件解析失败';
      }
      piece.file = null;
      renderAIFileList();
      refreshAIState();
    }
  } finally {
    aiParseBusy = false;
    refreshAIState();
  }
}

async function generateQuestions() {
  if (aiParseBusy) { toast('资料还在解析中，请稍候', 'info'); return; }
  if (!commitAISubject()) return;
  const groups = collectAIGroups();
  const mixed = groups.mixed;
  const runMode = mixed ? 'batch' : (groups.hasExams ? 'exam' : 'generate');
  const noteChars = aiVisibleChars(groups.noteText);
  const examChars = aiVisibleChars(groups.examText);

  if (mixed) {
    if (groups.noteText.length > 24000) {
      toast('笔记资料超过 24,000 字，请拆分后再上传', 'error', 5000);
      return;
    }
    if (groups.examText.length > 48000) {
      toast('真题资料超过 48,000 字，请拆分后再上传，避免漏题', 'error', 5000);
      return;
    }
    if (noteChars < 50 || examChars < 50) {
      toast('笔记和真题都需要至少 50 字才能一起整理', 'info');
      return;
    }
  } else if (runMode === 'exam' && groups.examText.length > 48000) {
    toast('真题资料超过 48,000 字，请拆分后再整理，避免漏题', 'error', 5000);
    return;
  }

  const material = runMode === 'exam'
    ? groups.examText.slice(0, 48000).trim()
    : groups.noteText.slice(0, 24000).trim();
  if (!mixed && aiVisibleChars(material) < 50) {
    toast('请先上传资料或粘贴文字（至少 50 字）', 'info');
    return;
  }

  const range = document.getElementById('aiCount');
  const min = Number(range?.min) || 3;
  const max = Number(range?.max) || 40;
  const count = groups.hasNotes ? Math.max(min, Math.min(max, parseInt(range?.value, 10) || min)) : 0;
  const types = groups.hasNotes ? document.getElementById('aiTypes').value : 'mixed';
  const codeLanguage = groups.hasNotes && types === 'with-code' ? document.getElementById('aiCodeLang').value : null;
  const estimate = groups.hasExams ? aiEstimateQuestions(groups.examText) : 0;
  // 冻结联动快照：真题整理模式绝不为了联动改写或强行归类原题，所以只有出题/笔记段带 focusTopic
  const wantFocus = aiFocus && runMode !== 'exam';
  const focusLink = wantFocus ? captureFocusLink() : null;
  const focusTopic = wantFocus ? cleanFocusText(aiFocusText()) : '';

  state.genPreview = null;
  aiStep = 3;
  const rail = document.getElementById('aiRail');
  const form = document.getElementById('aiFormWrap');
  const run = document.getElementById('aiRunWrap');
  const footer = document.getElementById('aiModalFooter');
  const errBox = document.getElementById('aiErrorBox');
  if (errBox) errBox.hidden = true;
  if (rail) renderAIRail();
  if (form) form.hidden = true;
  if (run) {
    run.hidden = false;
    const title = mixed ? 'Qoder AI 正在整理笔记和真题…' : (runMode === 'exam' ? 'Qoder AI 正在整理真题…' : 'Qoder AI 正在出题…');
    const sub = mixed
      ? `笔记生成 ${count} 题 · 真题${estimate > 0 ? `约 ${estimate} 题` : ''}全部原样保留`
      : runMode === 'exam'
        ? `${estimate > 0 ? `识别到约 ${estimate} 道题，` : ''}逐题保留，不改写不删减`
        : `共 ${count} 题，${count <= 12 ? '约需 20–60 秒' : count <= 25 ? '约需 1–2 分钟' : '约需 2–4 分钟'}`;
    run.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 0;gap:14px">
      <div class="spinner spinner-lg"></div>
      <div style="font-size:15px">${title}</div>
      <div class="text-sm text-muted ai-generating-sub">${sub}</div>
    </div>`;
  }
  if (footer) footer.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">取消</button><button class="btn btn-primary" disabled>${runMode === 'generate' ? '生成中…' : '整理中…'}</button>`;

  const controller = new AbortController();
  const deadline = runMode === 'generate' ? AI_POLL_DEADLINE_MS : AI_EXAM_DEADLINE_MS;
  const timer = setTimeout(() => controller.abort(), deadline + 10000);

  const payload = mixed
    ? { mode: 'batch', documents: groups.docs, count, types, codeLanguage, ...(focusTopic ? { focusTopic } : {}) }
    : { material, count, types, codeLanguage, mode: runMode, ...(focusTopic ? { focusTopic } : {}) };

  try {
    const startData = await startAISession(payload, controller.signal, (n) => {
      const sub = run && run.querySelector('.ai-generating-sub');
      if (sub) sub.textContent = `服务正在更新，自动重连中（第 ${n} 次）…`;
    });
    const sessionId = startData.sessionId;
    const defaultGroup = runMode === 'exam' ? 'exam' : 'note';
    const parts = Array.isArray(startData.sessions) && startData.sessions.length
      ? startData.sessions
          .map((item, i) => ({
            id: String((item && item.id) || ''),
            index: Number(item && item.index) || i,
            group: item && item.group === 'exam' ? 'exam' : (item && item.group === 'note' ? 'note' : defaultGroup),
            label: String((item && item.label) || ''),
            expected: Number(item && item.expected) || 0
          }))
          .filter((item) => item.id)
          .sort((a, b) => a.index - b.index)
          .map((item) => ({ id: item.id, index: item.index, group: item.group, label: item.label, expected: item.expected, set: null, running: false, idle: false, badOutput: 0, netErrors: 0 }))
      : [{ id: sessionId, index: 0, group: defaultGroup, label: '', expected: 0, set: null, running: false, idle: false, badOutput: 0, netErrors: 0 }];
    const totalParts = parts.length;

    const startedAt = Date.now();
    let set = null;
    // 合并已在浏览器里定稿的段：知识点重编号后必须重新验证目标考点与题目映射
    const mergeDoneParts = () => {
      const doneParts = parts.filter((part) => part.set);
      const merged = mergeGeneratedSets(doneParts.map((part) => part.set), doneParts);
      merged.subjectId = subjectById(aiSubjectId) ? aiSubjectId : 'sub-inbox';
      merged.origin = runMode;
      merged.focusTopic = focusTopic || '';
      attachCoverage(merged, doneParts);
      attachGeneratedSource(merged, focusLink);
      return merged;
    };

    if (startData.sync) {
      // 同步批次通道：3 路并发把每批题目拉回来。某一批失败只少这一批的题，
      // 其余批次照常入库，比整次生成失败重来划算。
      const failures = [];
      await mapLimit(parts, AI_SYNC_CONCURRENCY, async (part) => {
        try {
          const data = await requestAISyncJob(payload, part.index, controller.signal);
          if (data && data.set) part.set = normalizeSet(data.set);
        } catch (error) {
          if (error && error.name === 'AbortError') throw error;
          failures.push((error && error.message) || '这一批没有生成成功');
        }
        updateAIGenerating(run, count, startedAt, parts.filter((item) => item.set).length, totalParts, runMode, parts);
      });
      if (!parts.some((part) => part.set)) {
        throw new Error(failures[0] || 'AI 没有返回题目，请重试');
      }
      set = mergeDoneParts();
    } else while (!set) {
      if (Date.now() - startedAt > deadline) {
        throw new Error(runMode === 'generate' ? '生成超时了，请稍后重试，或减少题量' : '整理超时了，请拆分资料后重试');
      }
      await new Promise((resolve) => setTimeout(resolve, AI_POLL_INTERVAL_MS));

      const results = await Promise.all(parts.filter((part) => !part.set).map(async (part) => {
        try {
          const res = await fetch('/functions/v1/app/ai/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: part.id }),
            signal: controller.signal
          });
          const data = await res.json().catch(() => null);
          return { part, res, data };
        } catch (e) {
          if (e && e.name === 'AbortError') throw e;
          return { part, res: null, data: null };
        }
      }));

      let failure = null;
      for (const { part, res, data } of results) {
        const partNo = part.label || (totalParts > 1 ? `第 ${parts.indexOf(part) + 1} 段` : '');
        // 网络抖动、网关 5xx、部署窗口的 HTML 响应：连续多次才判定失败，能撑过发布时的后端重启
        if (!res || !data || res.status >= 500) {
          part.netErrors = (part.netErrors || 0) + 1;
          if (part.netErrors < 20) continue;
          failure = failure || (res ? aiErrorText(res.status, data) : '网络连接中断，请检查网络后再试');
          continue;
        }
        part.netErrors = 0;
        if (!res.ok) {
          const code = data && data.error && data.error.code;
          const message = data && data.error && data.error.message;
          if (code === 'ai_bad_output' && part.badOutput < 2) {
            part.badOutput += 1;
            continue;
          }
          failure = failure || (partNo && message ? `${partNo}失败：${message}` : aiErrorText(res.status, data));
          continue;
        }
        if (data.done && data.set) {
          if (!part.set) part.set = normalizeSet(data.set);
          continue;
        }
        for (const status of data.statuses || []) {
          if (!status || typeof status.type !== 'string') continue;
          if (status.type === 'session.status_running') part.running = true;
          if (status.type === 'session.status_idle') part.idle = true;
        }
        // 新会话可能先发一次 idle，等运行状态出现或过了 8 秒才当成真正的结束
        if (part.idle && !part.set && (part.running || Date.now() - startedAt > 8000)) {
          const errors = Array.isArray(data.errors) && data.errors.length;
          failure = failure || (partNo
            ? `${partNo}没有返回题目，请重试`
            : (errors ? 'AI 本次没有生成内容，请重试' : 'AI 没有返回题目，请重试'));
        }
      }
      if (failure) throw new Error(failure);

      const doneParts = parts.filter((part) => part.set).length;
      if (doneParts === totalParts) {
        set = mergeDoneParts();
        break;
      }
      updateAIGenerating(run, count, startedAt, doneParts, totalParts, runMode, parts);
    }
    state.genPreview = set;

    const examQuestions = parts.filter((part) => part.group === 'exam' && part.set)
      .reduce((n, part) => n + part.set.questions.length, 0);
    const noteQuestions = parts.filter((part) => part.group === 'note' && part.set)
      .reduce((n, part) => n + part.set.questions.length, 0);
    const sourceNote = runMode === 'batch'
      ? `（真题原文 ${examQuestions} · 笔记生成 ${noteQuestions}）`
      : (runMode === 'exam' ? '（全部来自原文）' : '');

    if (run) {
      run.hidden = false;
      run.innerHTML = `
        <div class="ai-generate-area" style="margin-bottom:0">
          <h3>${runMode === 'generate' ? '生成成功' : '整理完成'}</h3>
          <p data-no-i18n>${esc(set.name)}</p>
        </div>
        <div class="text-sm" style="line-height:1.8">
          <div>题目数：<b>${set.questions.length}</b>${sourceNote}</div>
          <div>知识点：<b>${set.knowledgePoints.length}</b></div>
          ${renderFocusAttribution(set, focusLink)}
          <div style="margin-top:6px">题型：${Object.entries(set.questions.reduce((m, q) => (m[q.type] = (m[q.type] || 0) + 1, m), {})).map(([t, n]) => `<span class="badge ${TYPE_CLASS[t] || 'badge-muted'}">${TYPE_LABEL[t] || t} × ${n}</span>`).join(' ')}</div>
        </div>
        ${renderQuality(set)}`;
    }
    if (footer) footer.innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal()">放弃</button>
      <button class="btn btn-primary" onclick="importGenerated()">保存练习集</button>`;
  } catch (e) {
    const message = e && e.name === 'AbortError'
      ? (runMode === 'generate' ? '生成超时了，请稍后重试，或减少题量、缩短资料' : '整理超时了，请拆分资料后重试')
      : (e && e.message) || '请检查网络后重试';
    if (run) run.hidden = true;
    if (form) form.hidden = false;
    if (errBox) {
      errBox.hidden = false;
      const previewHint = message.includes(OFFICIAL_SITE_URL)
        ? `<div style="margin-top:10px"><a class="btn btn-secondary btn-sm" href="${OFFICIAL_SITE_URL}" target="_blank" rel="noopener">在正式站点打开</a></div>`
        : '';
      errBox.innerHTML = `<div class="feedback-title">${runMode === 'generate' ? '生成失败' : '整理失败'}</div><div>${esc(message)}</div>${previewHint}`;
    }
    if (footer) footer.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="goAIStep(2)">← 上一步</button>
      <span style="flex:1"></span>
      <button class="btn btn-primary" id="aiGenerateBtn" onclick="generateQuestions()">${runMode === 'generate' ? '重新生成' : '重新整理'}</button>`;
    if (rail) renderAIRail();
    refreshAIState();
    toast(message, 'error', 4500);
  } finally {
    clearTimeout(timer);
  }
}

let genSaving = false;

function importGenerated() {
  if (!state.genPreview || genSaving) return;
  genSaving = true;
  // 练习集与联动关系的关联只由 set.source.linkId 派生，不在 link 上另存一份 setIds
  customSets.push(state.genPreview);
  if (!saveJSON(STORAGE.sets, customSets)) {
    customSets.pop();
    genSaving = false;
    toast('空间不足，练习集没有保存。请先导出备份并清理不用的练习集', 'error', 5000);
    return;
  }
  const id = state.genPreview.id;
  const subjectId = state.genPreview.subjectId || 'sub-inbox';
  genSaving = false;
  state.genPreview = null;
  closeModal();
  toast(`练习集已保存到「${(subjectById(subjectId) || INBOX_SUBJECT).name}」`, 'success');
  state.view = 'setDetail';
  state.setId = id;
  state.subjectId = subjectId;
  render();
  const body = $('.main-body');
  if (body) body.scrollTop = 0;
}

async function judgeRun(language, source, stdin) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 25000) : null;
  try {
    const res = await fetch('/functions/v1/app/judge/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, source, stdin }),
      ...(controller ? { signal: controller.signal } : {})
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok) {
      if (res.status === 405) {
        throw new Error(`当前页面不支持后端服务（HTTP 405），编程题判题需要在正式站点使用：${OFFICIAL_SITE_URL}`);
      }
      throw new Error((data && data.error && data.error.message) || `判题服务暂不可用（HTTP ${res.status || '未知'}）`);
    }
    if (!data.result || typeof data.result !== 'object') {
      throw new Error('判题服务返回了异常结果，请稍后重试');
    }
    return data.result;
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('判题超时（25 秒），请稍后重试');
    if (e instanceof TypeError) throw new Error('网络连接失败，判题服务暂不可用');
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function gradeObjective(q, ans) {
  if (q.type === 'single') return ans === q.answer;
  if (q.type === 'tf') return ans === q.answer;
  if (q.type === 'multi') return Array.isArray(ans) && ans.length > 0 && sameSet(ans, q.answer);
  if (q.type === 'fill') {
    const list = Array.isArray(q.answer) ? q.answer : [q.answer];
    return list.some((a) => norm(a) === norm(ans));
  }
  return null;
}

/* —— 错题本写入：两种模式评分时都只走 updateWrongBank，条目状态由这里统一维护 —— */

function saveWrongBank() {
  return saveJSON(STORAGE.wrong, wrongBank);
}

// 一次作答只记一次：断点恢复或重复交卷不会把「错 N 次」刷高
function learningAttemptId(l) {
  return `L${(Number(l && l.startedAt) || 0).toString(36)}`;
}

function recordWrong(setId, qid, meta) {
  const opts = objOf(meta);
  const sid = strOf(setId, 64);
  const key = strOf(qid, 64);
  if (!sid || !key) return false;
  const attemptId = strOf(opts.attemptId, 64).trim();
  const now = wrongStampOf(opts.at) || Date.now();
  const map = wrongBank.bySet[sid] || (wrongBank.bySet[sid] = {});
  const entry = map[key];
  if (entry && entry.times && attemptId && entry.lastAttemptId === attemptId) return false;
  if (entry && entry.times) {
    entry.times = Math.min(999, entry.times + 1);
    entry.status = 'open';
    entry.firstWrongAt = entry.firstWrongAt || now;
    entry.lastWrongAt = now;
    if (attemptId) entry.lastAttemptId = attemptId;
    if (!entry.kpId) entry.kpId = wrongKpIdOf(sid, key);
  } else {
    map[key] = {
      times: 1,
      status: 'open',
      kpId: wrongKpIdOf(sid, key),
      firstWrongAt: now,
      lastWrongAt: now,
      lastCorrectAt: null,
      lastAttemptId: attemptId
    };
  }
  if (!opts.silent) saveWrongBank();
  return true;
}

// 答对＝归档而不是删除：次数、首错时间都留在本子里，「重新列入」随时能把它放回待复习
function archiveWrong(setId, qid, meta) {
  const opts = objOf(meta);
  const entry = objOf(objOf(wrongBank.bySet[strOf(setId, 64)])[strOf(qid, 64)]);
  if (!entry || !entry.times) return false;
  const attemptId = strOf(opts.attemptId, 64).trim();
  if (entry.status === 'mastered' && (!attemptId || entry.lastAttemptId === attemptId)) return false;
  entry.status = 'mastered';
  entry.lastCorrectAt = wrongStampOf(opts.at) || Date.now();
  if (attemptId) entry.lastAttemptId = attemptId;
  if (!opts.silent) saveWrongBank();
  return true;
}

function reopenWrong(setId, qid) {
  const entry = objOf(objOf(wrongBank.bySet[strOf(setId, 64)])[strOf(qid, 64)]);
  if (!entry || !entry.times || entry.status === 'open') return false;
  entry.status = 'open';
  entry.lastCorrectAt = null;
  entry.lastAttemptId = '';
  return saveWrongBank();
}

// 彻底移出错题本：只给「这道题我不想再在本子里看到」和删练习集/删题时用
function dropWrong(setId, qid) {
  const sid = strOf(setId, 64);
  const map = objOf(wrongBank.bySet[sid]);
  if (!Object.prototype.hasOwnProperty.call(map, strOf(qid, 64))) return false;
  delete map[strOf(qid, 64)];
  if (!Object.keys(map).length) delete wrongBank.bySet[sid];
  return saveWrongBank();
}

function updateWrongBank(setId, qid, correct, meta) {
  if (correct === true) return archiveWrong(setId, qid, meta);
  if (correct === false) return recordWrong(setId, qid, meta);
  return false; // 未评分（判题服务不可用）不动错题本
}

// 异步流程里的异常不阻断页面，只记录，避免用户看到白屏
window.addEventListener('error', (e) => {
  if (e && e.error) console.error('[StarQuiz] 未捕获异常', e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  if (e && e.reason) console.error('[StarQuiz] 未处理的异步异常', e.reason);
});
// 关闭/切走页面前，把还在防抖里的作答立即落盘
window.addEventListener('pagehide', () => {
  if (state.exam) persistExam();
  if (state.learning) persistLearning();
});

(async function boot() {
  // 标签页名字里的一次性快照要最早取走并清空：它只在「刚从 Exam Plan 点过来」这件事上有意义
  examHandoff = takeExamHandoff();
  applySidebarPref();
  await loadMaterials();
  if (materialsUnavailable) bootNotes.push('当前浏览器无法打开本地资料库，上传的资料这次不会保留');
  loadResumeSessions();
  render();
  // 联动入站要算考点钥匙（Web Crypto 异步），放在首屏渲染之后，不阻塞页面
  await applyPlanDeepLink();

  if (bootNotes.length) {
    const notes = [...new Set(bootNotes)];
    setTimeout(() => toast(notes.join('；'), 'info', 6000), 700);
  }
})();
