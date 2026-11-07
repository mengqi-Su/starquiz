/* XSS 回归（清单 SEC-05 的收口方式：把 payload 固化成测试，而不是靠人肉读渲染函数）
 *
 * 为什么值得单独一个文件：app.js 有 51 处 `.innerHTML =` 模板出口，安全靠的是每个用户可写
 * 字段在拼进模板前过一次 esc()。少写一次不会报错，只会安静地等着某天被利用。这个页面把
 * 「存进本地数据 → 走完每个视图 → 断言没有任何一段被当成代码执行」固化下来：以后新增任何
 * 渲染入口，跑它就该守住。
 *
 * 运行（不需要装任何东西，只在本机）：
 *   cd starquiz
 *   node dev/serve.mjs 4401
 *   打开 http://127.0.0.1:4401/dev/xss-regression.html
 * 判定：报告最后一行是 ALL PASS。它同时要求
 *   ① payload 想赋值的 window.__p 全程 undefined（没被执行）
 *   ② 渲染区域里没有任何 on* 属性带上 payload 痕迹（属性逃逸没发生）
 *   ③ 没有任何 <script>/<object>/<embed>/<iframe> 由用户数据造出来
 *   ④ 核心字段的 payload 原文确实出现在界面标记里（不是被静默吞掉后的「假通过」）
 *
 * 反面样本（证明这个守卫真的会响，2026-11-08 跑过）：把 app.js 里
 * 「<h2 class="ui-doc-title" …>${esc(subject.name)}</h2>」的 esc() 去掉再跑，
 * 报告会在「科目页」一步 FAIL，并指出 #mainContent 里出现带 __p 的 onload 属性。
 */

const SINK = '__p';   // 每个 payload 都试图执行 __p='<自己的编号>'；经典脚本非严格模式 → 落到 window
const MATERIAL_DB = 'starquiz-materials';
const SUBJECT_ID = 'sub-xss01';
const SET_ID = 'set-xss01';
const KP_ID = 'kp-x1';

/* ===== payload =====
 * 编号放在最前面：字段有长度上限（科目名 40、标签 20），截断后编号仍在，
 * 断言才能区分「渲染成文本」和「被静默丢掉」。 */
const SHAPES = {
  tag: (id) => `<svg/onload=${SINK}='${id}'>`,        // 全新元素 + 事件属性：最常见的 innerHTML 直插
  img: (id) => `<img src=x onerror=${SINK}='${id}'>`, // 内联标签混在正文里
  dq: (id) => `${id}" autofocus onfocus=${SINK}='${id}' data-x="`,  // 从双引号属性里逃出来
  sq: (id) => `${id}' onfocus=${SINK}='${id}' x='`,   // 从单引号属性里逃出来
  url: (id) => `javascript:${SINK}='${id}'#${id}`     // 伪协议：只在看 URL 的字段上试
};

const SENTINELS = new Map();   // id -> { id, shape, field, core, expect }

function payload(id, shape, meta) {
  SENTINELS.set(id, { id, shape, ...meta });
  return shape === 'url' ? SHAPES.url(id) : id + SHAPES[shape](id);
}

/* ===== 种子数据：一个科目、一套五种题型齐全的练习集、一条历史、一份资料 ===== */

function seedSubjects(now) {
  return [
    {
      id: SUBJECT_ID,
      name: payload('x01', 'tag', { field: '科目名', core: true }),
      icon: '💻',
      cover: payload('x02', 'url', { field: '科目封面', core: false, expect: 'absent' }),  // coverOf 只认预设与 data:image/
      examName: payload('x03', 'dq', { field: '考试名称', core: true }),
      examDate: '2026-12-20',
      startDate: '2026-11-01',
      goal: payload('x04', 'img', { field: '备考目标', core: true }),
      defaultCount: 15,
      dailyGoal: 20,
      createdAt: now
    }
  ];
}

function seedSets(now) {
  return [
    {
      id: SET_ID,
      subjectId: SUBJECT_ID,
      name: payload('x05', 'img', { field: '练习集名', core: true }),
      description: payload('x06', 'dq', { field: '练习集简介', core: true }),
      icon: '题',
      tags: [payload('x07', 'img', { field: '练习集标签（20 字上限，会被截断）', core: false })],
      focusTopic: payload('x08', 'img', { field: '聚焦考点', core: false }),
      origin: 'generate',
      knowledgePoints: [
        { id: KP_ID, title: payload('x09', 'sq', { field: '知识点标题', core: true }), content: payload('x10', 'tag', { field: '知识点内容', core: false }) }
      ],
      questions: [
        {
          id: 'qx1', type: 'single', difficulty: 2, knowledgePointId: KP_ID,
          content: payload('x11', 'tag', { field: '单选题干', core: true }),
          options: ['正常选项 A', payload('x12', 'img', { field: '单选选项', core: true })],
          answer: 0,
          explanation: payload('x13', 'dq', { field: '单选解析', core: true })
        },
        {
          id: 'qx2', type: 'multi', difficulty: 1, knowledgePointId: KP_ID,
          content: payload('x14', 'sq', { field: '多选题干', core: true }),
          options: [payload('x15', 'tag', { field: '多选选项', core: false }), '正常选项 B'],
          answer: [0],
          explanation: payload('x16', 'img', { field: '多选解析', core: false })
        },
        {
          id: 'qx3', type: 'tf', difficulty: 3, knowledgePointId: KP_ID,
          content: payload('x17', 'tag', { field: '判断题干', core: false }),
          answer: false,
          explanation: payload('x18', 'dq', { field: '判断解析', core: false })
        },
        {
          id: 'qx4', type: 'fill', difficulty: 2, knowledgePointId: KP_ID,
          content: payload('x19', 'img', { field: '填空题干', core: false }),
          answer: [payload('x20', 'dq', { field: '填空正确答案', core: true })]
        },
        {
          id: 'qx5', type: 'code', difficulty: 2, language: 'javascript', knowledgePointId: KP_ID,
          content: payload('x21', 'tag', { field: '编程题干', core: false }),
          template: payload('x22', 'dq', { field: '编程初始代码', core: false }),
          answer: payload('x23', 'sq', { field: '编程参考答案', core: false }),
          testCases: [{ input: payload('x24', 'img', { field: '编程用例输入', core: false }), expectedOutput: '1' }]
        }
      ],
      source: {
        from: 'exam-plan',
        planId: 'plan-xss',
        topicKey: `t1_${'0123456789abcdef'.repeat(2)}`,
        knowledgePointId: KP_ID,
        returnEnabled: true,
        linkedAt: new Date(now).toISOString(),
        path: {
          level: 'subtopic',
          subject: payload('x25', 'img', { field: '联动：规划侧科目名', core: false }),
          unit: payload('x26', 'img', { field: '联动：规划侧单元名', core: false }),
          topic: payload('x27', 'dq', { field: '联动：目标考点', core: true }),
          exam: payload('x28', 'tag', { field: '联动：考试名', core: false })
        }
      },
      createdAt: now
    }
  ];
}

function seedHistory(now) {
  return [
    {
      id: 'att-x1',
      setId: SET_ID,
      setName: payload('x29', 'sq', { field: '历史记录里的练习集名', core: true }),
      mode: 'exam',
      startedAt: now - 600000,
      finishedAt: now - 300000,
      durationSec: 300,
      total: 2,
      graded: 2,
      correct: 1,
      score: 50,
      answers: [
        { qid: 'qx1', type: 'single', userAnswer: 0, correct: true },
        { qid: 'qx4', type: 'fill', userAnswer: payload('x30', 'dq', { field: '历史：用户作答原文', core: false }), correct: false }
      ]
    }
  ];
}

function seedWrong(now) {
  return {
    version: 2,
    bySet: {
      [SET_ID]: {
        qx1: { times: 2, status: 'open', kpId: KP_ID, firstWrongAt: now - 86400000, lastWrongAt: now - 86400000, lastCorrectAt: null },
        qx4: { times: 1, status: 'open', kpId: KP_ID, firstWrongAt: now - 172800000, lastWrongAt: now - 172800000, lastCorrectAt: null }
      }
    }
  };
}

function seedMaterials(now) {
  return [
    {
      id: 'mat-x1',
      subjectId: SUBJECT_ID,
      name: payload('x31', 'img', { field: '资料文件名', core: true }),
      text: '正常资料正文，用来确认这条资料不是空的。',
      size: 1234,
      ext: 'md',
      kind: 'note',
      pages: 0,
      chars: 17,
      addedAt: now,
      hasBlob: false
    }
  ];
}

// 考试模式里现场打进去的 payload：用户作答是另一条独立入口，不来自本地存储
const EXAM_ANSWER = payload('x32', 'dq', { field: '本次作答填入的 payload', core: false });

/* ===== 走完界面 ===== */

const REGION_IDS = ['mainContent', 'modalContainer', 'headerActions', 'resumeSlot', 'bottomNav', 'sidebar', 'toastContainer'];

function buildWalk(w, snap) {
  const call = (fn, ...args) => () => {
    if (typeof w[fn] !== 'function') throw new Error(`app.js 里没有 ${fn}()`);
    w[fn](...args);
  };
  const close = () => { if (typeof w.closeModal === 'function') w.closeModal(); };
  // snap()：一次界面只渲染一道题的地方（学习/考试的逐题翻页）必须每翻一页就采一次，
  // 否则只有最后一页进得了对照文本，别的题的选项会被误报成「没渲染出来」。
  return [
    { name: '首页', run: call('doNavigate', 'dashboard') },
    { name: '练习集总览', run: call('doNavigate', 'sets') },
    { name: '科目页（页头属性 + 资料 + 练习集卡）', run: call('openSubject', SUBJECT_ID) },
    { name: '练习集详情（题干/选项/解析/考点）', run: call('openSet', SET_ID) },
    { name: '弹窗：编辑考试信息', run: () => { w.openSubject(SUBJECT_ID); w.examInfoModal(SUBJECT_ID); } },
    { name: '弹窗：移动练习集', run: () => { close(); w.openSet(SET_ID); w.moveSetModal(SET_ID); } },
    { name: '弹窗：新建练习科目', run: () => { close(); w.newSubjectModal(); } },
    { name: '弹窗：AI 出题（资料名 + 联动考点）', run: () => { close(); w.openAIModal(SUBJECT_ID, ['mat-x1']); } },
    { name: '弹窗：考试设置', run: () => { close(); w.startExamModal(SET_ID); } },
    { name: '弹窗：错题组卷', run: () => { close(); w.startWrongMockModal(); } },
    { name: '错题本', run: () => { close(); w.doNavigate('wrong'); } },
    { name: '学习模式（逐题走完）', run: () => { w.startLearning(SET_ID); for (let i = 0; i < 5; i++) { w.learningGo(i); snap(); } } },
    { name: '考试模式（把 payload 打进取答框）', run: () => { w.beginExam(SET_ID); for (let i = 0; i < 5; i++) { try { w.examGo(i); w.examFillInput(i, EXAM_ANSWER); snap(); } catch { /* 交卷前的渲染才是断言对象 */ } } } },
    { name: '交卷 → 成绩回顾', run: () => { w.submitExam(true); } },
    { name: '设置页', run: () => { w.doNavigate('settings'); } }
  ];
}

/* ===== 检查 ===== */

function scanExecution(w) {
  return w[SINK] === undefined ? [] : [`${SINK} 被赋值为 ${String(w[SINK])}：有 payload 被执行了`];
}

function scanRegions(w, doc) {
  const violations = [];
  const markup = [];
  for (const id of REGION_IDS) {
    const el = doc.getElementById(id);
    if (!el) { violations.push(`区域 #${id} 不存在，界面结构变了`); continue; }
    markup.push(el.innerHTML);
    for (const node of el.querySelectorAll('*')) {
      const tag = node.tagName.toUpperCase();
      if (tag === 'SCRIPT' || tag === 'OBJECT' || tag === 'EMBED' || tag === 'IFRAME') {
        violations.push(`#${id} 里出现 <${node.tagName.toLowerCase()}>：用户数据造出了可执行元素`);
      }
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') && attr.value.includes(SINK)) {
          violations.push(`#${id} 里 ${node.tagName.toLowerCase()} 带上事件属性 ${name}="${attr.value}"：属性逃逸成功`);
        }
        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attr.value)) {
          violations.push(`#${id} 里 ${node.tagName.toLowerCase()} 的 ${name} 用了 javascript: 伪协议：${attr.value}`);
        }
      }
    }
  }
  return { violations, markup: markup.join('\n') };
}

/* ===== 驱动 ===== */

function openMaterialDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MATERIAL_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('materials')) db.createObjectStore('materials', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('资料库打不开'));
  });
}

async function seed() {
  const now = Date.now();
  localStorage.clear();
  localStorage.setItem('sq_subjects_v1', JSON.stringify(seedSubjects(now)));
  localStorage.setItem('sq_sets_v1', JSON.stringify(seedSets(now)));
  localStorage.setItem('sq_history_v1', JSON.stringify(seedHistory(now)));
  localStorage.setItem('sq_wrong_v1', JSON.stringify(seedWrong(now)));
  const db = await openMaterialDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readwrite');
    tx.objectStore('materials').clear();
    for (const meta of seedMaterials(now)) tx.objectStore('materials').put(meta);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error('资料写入失败'));
  });
  db.close();
}

function waitForApp(w) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (typeof w.doNavigate === 'function' && typeof w.beginExam === 'function') return resolve();
      if (Date.now() - started > 8000) return reject(new Error('app.js 8 秒内没起来（界面函数都不存在）'));
      setTimeout(tick, 50);
    };
    tick();
  });
}

function loadFrame() {
  return new Promise((resolve, reject) => {
    document.getElementById('appFrame')?.remove();
    const frame = document.createElement('iframe');
    frame.id = 'appFrame';
    frame.src = '../web/index.html';
    frame.style.cssText = 'width:1280px;height:900px;border:1px solid #ccc';
    frame.addEventListener('error', () => reject(new Error('iframe 加载失败：检查 dev/serve.mjs 有没有在跑')));
    document.body.appendChild(frame);
    frame.addEventListener('load', () => resolve(frame));
    setTimeout(() => reject(new Error('iframe 10 秒内没有 load')), 10000);
  });
}

async function run() {
  const report = document.getElementById('report');
  const lines = [];
  const failures = [];
  const push = (text) => { lines.push(text); report.textContent = lines.join('\n'); };

  push('xss regression — 正在写入带 payload 的本地数据…');
  await seed();
  const frame = await loadFrame();
  const w = frame.contentWindow;
  const doc = frame.contentDocument;
  await waitForApp(w);
  // 资料从 IndexedDB 异步读；等它落到 materials 里再开始走界面
  await new Promise((r) => setTimeout(r, 1200));

  let markup = '';
  let currentStep = '';
  const scanStep = () => {
    const { violations, markup: snapshot } = scanRegions(w, doc);
    markup += snapshot;
    for (const v of violations) failures.push(`${currentStep}: ${v}`);
  };
  const walk = buildWalk(w, scanStep);
  push(`app.js 已加载；${SENTINELS.size} 个 payload 字段 × ${walk.length} 个界面\n`);

  for (const step of walk) {
    currentStep = step.name;
    let note = '';
    try {
      step.run();
      await new Promise((r) => setTimeout(r, 80));
    } catch (err) {
      note = `（这一步抛错：${err && err.message}）`;
    }
    scanStep();
    const exec = scanExecution(w);
    if (exec.length) failures.push(`${step.name}: ${exec[0]}`);
    const stepFailures = failures.filter((f) => f.startsWith(`${step.name}:`));
    push(stepFailures.length ? `FAIL ${step.name} ${note}\n  - ${stepFailures.map((f) => f.slice(step.name.length + 2)).join('\n  - ')}` : `ok   ${step.name} ${note}`);
    if (exec.length) break;   // 一旦被执行，后面的结论都不必再看了
  }

  const missing = [];
  const unexpected = [];
  const unseenQuiet = [];
  for (const { id, field, core, expect } of SENTINELS.values()) {
    const present = markup.includes(id);
    if (expect === 'absent') {
      if (present) unexpected.push(`${id} ${field}：本应被清洗掉，却出现在界面里`);
      continue;
    }
    if (present) continue;
    if (core) missing.push(`${id} ${field}：payload 没出现在界面标记里，断言看不到转义结果（被丢弃或根本没渲染）`);
    else unseenQuiet.push(`${id} ${field}`);
  }

  push('');
  const shown = [...SENTINELS.values()].filter(({ id, expect }) => expect !== 'absent' && markup.includes(id)).length;
  push(`界面文本里认出的 payload 编号：${shown}/${SENTINELS.size}`);
  if (unseenQuiet.length) push(`   其中这些非核心字段没被任何界面渲染（记录用，不算失败）：${unseenQuiet.join('、')}`);
  for (const m of missing) { failures.push(m); push(`FAIL ${m}`); }
  for (const u of unexpected) { failures.push(u); push(`FAIL ${u}`); }
  if (!missing.length && !unexpected.length) push('ok   核心 payload 均以文本形式出现，被清洗的字段确实没进界面');

  push('');
  push(failures.length ? `FAILED (${failures.length})` : `ALL PASS (${SENTINELS.size} payload fields × ${walk.length} views)`);
  document.title = failures.length ? 'xss regression FAILED' : 'xss regression ALL PASS';
}

run().catch((err) => {
  document.getElementById('report').textContent = `RUNNER ERROR: ${err && err.stack ? err.stack : err}`;
  document.title = 'xss regression RUNNER ERROR';
});
