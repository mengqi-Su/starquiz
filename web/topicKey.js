/*
 * 考点稳定钥匙 topicKey（联动协议 v1）
 *
 * 与 Exam Plan 的 `src/lib/topicKey.ts` 是同一套算法的两份实现：
 * 「层级 + 学科 + 单元 + 子考点」→ NFKC 规范化 → JSON 数组路径 → Web Crypto SHA-256 前 128 bit。
 * 两个应用不共享存储、不登录，只靠这条内容钥匙认出同一个考点。
 *
 * ⚠️ 必须在 app.js 之前加载；改动算法或规范化步骤时，另一端必须同步，
 * 并跑 Exam Plan 侧 `npm run test:topickey`（该测试会加载本文件逐向量互校）。
 *
 * 已知边界：标题、单元归属或学科名变化后钥匙随之变化；本阶段不做新旧钥匙合并。
 */

const TOPIC_KEY_ALGORITHM = 'exam-plan-topic-v1';
const TOPIC_KEY_PREFIX = 't1_';
const TOPIC_KEY_HEX_LENGTH = 32; // SHA-256 前 128 bit

function normalizeSegment(value) {
  const raw = value === null || value === undefined ? '' : String(value);
  return raw
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function requireLevel(level) {
  const normalized = normalizeSegment(level);
  if (normalized !== 'unit' && normalized !== 'subtopic') {
    throw new Error(`未知的联动层级：${level === null || level === undefined ? '' : String(level)}`);
  }
  return normalized;
}

/* 用 JSON 数组而不是分隔符拼路径，避免标题里的 ":"、"/" 造成歧义；单元级目标的子考点段固定为空。 */
function canonicalPath(input) {
  const source = input || {};
  const level = requireLevel(source.level);
  return JSON.stringify([
    TOPIC_KEY_ALGORITHM,
    level,
    normalizeSegment(source.subject),
    normalizeSegment(source.unit),
    level === 'subtopic' ? normalizeSegment(source.topic) : '',
  ]);
}

/* 只用 Web Crypto；不可用时直接报错，绝不静默换成另一种哈希（那会让两端钥匙对不上）。 */
async function sha256Hex(text) {
  const subtle = typeof crypto !== 'undefined' ? crypto.subtle : null;
  if (!subtle) throw new Error('当前环境缺少 Web Crypto SHA-256，请在 HTTPS 或 localhost 下使用。');
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function topicKey(input) {
  const hex = await sha256Hex(canonicalPath(input));
  return `${TOPIC_KEY_PREFIX}${hex.slice(0, TOPIC_KEY_HEX_LENGTH)}`;
}

/* linkId = planId + ":" + topicKey；同一考点可能同时存在于多个备考计划中。 */
function composeLinkId(planId, key) {
  const plan = normalizeSegment(planId);
  const topic = String(key || '').trim();
  if (!plan || !topic) throw new Error('构造 linkId 需要同时具备 planId 与 topicKey。');
  return `${plan}:${topic}`;
}

/* 两端共享的固定测试向量（方案 §10.1）。期望值一旦变化说明算法被单方面改动。 */
const TOPIC_KEY_VECTORS = [
  { id: 'basic-zh', level: 'unit', subject: '中国近代史', unit: '辛亥革命', topic: '辛亥革命', expect: 't1_f21e660d4d215529212a5bb41ebe5062' },
  { id: 'long-zh', level: 'subtopic', subject: '思想政治必修四文化生活', unit: '文化多样性与文化传播：文化的内涵与特点', topic: '世界文化具有多样性，民族文化的特殊性普遍性', expect: 't1_7acccceaae18b5f54bdb8091f11cec78' },
  { id: 'whitespace', level: 'subtopic', subject: '  计算  机  网 络 ', unit: ' TCP/IP  协议 ', topic: ' 三次\t握手 ', expect: 't1_5cd5ee5aab32139e1809da6f71a265b6' },
  { id: 'fullwidth', level: 'subtopic', subject: 'ＨＴＴＰ协议', unit: '状态码（全角）', topic: '４０４ Not Found', expect: 't1_543fbe9868e22b328200bb26cd0af08e' },
  { id: 'english-case', level: 'unit', subject: 'Computer Networks', unit: 'Transport Layer', topic: 'Transport Layer', expect: 't1_88f4c15aa2d3dfa8ac5978db26f470e3' },
  { id: 'parens', level: 'subtopic', subject: '生物（选修1）', unit: '细胞结构(线粒体)', topic: '有丝分裂（中期）', expect: 't1_8b4f92e1b518f763029c33f0740c750f' },
  { id: 'special-chars', level: 'subtopic', subject: 'C&C++ / Java', unit: '算法 #1: 递归?', topic: 'emoji 🚀 与 &/#', expect: 't1_55100f40adb43a7d5308169aafb121ea' },
  { id: 'same-topic-different-unit-a', level: 'subtopic', subject: '数学', unit: '函数', topic: '极限', expect: 't1_89a1d65483ef83987c5fc26a0a7f20fa' },
  { id: 'same-topic-different-unit-b', level: 'subtopic', subject: '数学', unit: '数列', topic: '极限', expect: 't1_5c279df07a6804ebdd128d80bf17bc1c' },
  { id: 'unit-level-target', level: 'unit', subject: '物理', unit: '力学', topic: '力学', expect: 't1_c10735bdc81268987a10cc521078be4e' },
  { id: 'subtopic-level-same-text', level: 'subtopic', subject: '物理', unit: '力学', topic: '力学', expect: 't1_5fdbecf796abfd53392aa90b4ee391d4' },
  { id: 'unit-level-topic-empty', level: 'unit', subject: '物理', unit: '力学', topic: '', expect: 't1_c10735bdc81268987a10cc521078be4e' },
  { id: 'unit-level-topic-noise', level: 'unit', subject: '物理', unit: '力学', topic: '  完全无关的展示名 ', expect: 't1_c10735bdc81268987a10cc521078be4e' },
  { id: 'empty-segments', level: 'subtopic', subject: '', unit: '   ', topic: '总论', expect: 't1_0892bdc71996249ee3789b6e9745d278' },
  { id: 'all-empty', level: 'unit', subject: '', unit: '', topic: '', expect: 't1_ecac5d9b5a55bda8b52035e2115d8e98' },
  { id: 'whitespace-variants-equal', level: 'subtopic', subject: '　历史　', unit: '  明清时期 ', topic: '闭关锁国　\t', expect: 't1_279be9cdcfd600406fbe545c7a3489ba' },
  { id: 'internal-space-matters', level: 'subtopic', subject: '历史', unit: '明清时期', topic: '闭关 锁国', expect: 't1_b9ea00017a9a971eb8ad95d0a76ad91f' },
];

/* 浏览器里可随时自测：控制台执行 StarQuizTopicKey.selfTest()。 */
async function selfTest() {
  const failed = [];
  for (const vector of TOPIC_KEY_VECTORS) {
    const actual = await topicKey(vector);
    if (actual !== vector.expect) failed.push({ id: vector.id, expect: vector.expect, actual, path: canonicalPath(vector) });
  }
  return { total: TOPIC_KEY_VECTORS.length, passed: TOPIC_KEY_VECTORS.length - failed.length, failed };
}

const StarQuizTopicKey = {
  TOPIC_KEY_ALGORITHM,
  TOPIC_KEY_PREFIX,
  TOPIC_KEY_HEX_LENGTH,
  TOPIC_KEY_VECTORS,
  normalizeSegment,
  requireLevel,
  canonicalPath,
  sha256Hex,
  topicKey,
  composeLinkId,
  selfTest,
};

globalThis.StarQuizTopicKey = StarQuizTopicKey;
