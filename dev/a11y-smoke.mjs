/* 键盘可达性与焦点指示的静态守卫：node dev/a11y-smoke.mjs
 *
 * 守的是清单 A11Y-04 / A11Y-05 修完之后不再退回去，四条底线：
 *   1) style.css 里每一处 outline:none 都必须有同选择器的 :focus-visible 规则补回来，
 *      且那条规则真的画了环（不是又写一遍 none）。压掉浏览器默认环本身没错，
 *      错在压掉之后不补——键盘用户就再也看不见焦点落在哪个输入框。
 *   2) 不许 transition: all。它会把 outline / transform / 布局属性一起插值，
 *      焦点环淡入等于迟到，合成成本也白付。只过渡真的会变的那几项。
 *   3) 模板里带 onclick 的非原生元素（div/article/span…）必须自带 role + tabindex + 键盘路径，
 *      或者落在两张显式名单里：SCRIMS 是「点空白处关闭」且证明了 Escape 等价，
 *      INERT 是压根没渲染出来的残留 markup（另有一条断言钉住它确实是死的）。
 *      名单是显式的：新写一个可点 div 就会红，逼一次决定，而不是默默漏掉。
 *   4) 向导步骤条必须是原生 <button>：Tab / Enter / Space 由浏览器负责，
 *      走不到的步骤用 disabled 而不是「看着能点其实没绑事件」。
 *
 * 这是静态检查，不替代浏览器实测：环的对比度、聚焦后是否被 overflow 裁掉、
 * 按下 Enter 是否真的换层，都要在 127.0.0.1:4401 上按一遍才算数。
 * 纯 Node，无依赖，不碰用户数据。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/* ── CSS 解析：只取叶子规则（不含嵌套块的声明块），@media / @keyframes 的外壳不算 ── */
const stripCssComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '');
/* 引号里的内容不参与花括号配对（font-family 字符串、content: "…"） */
const maskStrings = (src) => src.replace(/"[^"\n]*"|'[^'\n]*'/g, '""');

function cssRules(src) {
  const text = maskStrings(stripCssComments(src));
  const rules = [];
  const stack = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (stack.length) stack[stack.length - 1].hasChild = true;
      stack.push({ selector: buf.trim(), start: i + 1, hasChild: false });
      buf = '';
    } else if (ch === '}') {
      const top = stack.pop();
      if (top && !top.hasChild) rules.push({ selector: top.selector, body: text.slice(top.start, i) });
      buf = '';
    } else {
      buf += ch;
    }
  }
  return rules;
}

const selectorList = (sel) => sel.split(',').map((s) => s.trim()).filter(Boolean);
const OUTLINE_OFF = /\boutline(?:-style)?\s*:\s*(?:none|0)\s*(?:;|!important|$)/i;
const OUTLINE_ON = /\boutline\s*:\s*(?!none\b|0\b)[^;]+/i;
const TRANSITION_ALL = /\btransition\s*:\s*all\b/i;

/* 每条 outline:none 的选择器都要能在别处找到「同选择器 + :focus-visible」且真的画环 */
function outlineOffenses(css) {
  const rules = cssRules(css);
  const visible = new Set();
  for (const rule of rules) {
    if (!rule.selector.includes(':focus-visible')) continue;
    if (!OUTLINE_ON.test(rule.body) && !/\boutline-color\s*:/i.test(rule.body)) continue;
    for (const part of selectorList(rule.selector)) visible.add(part);
  }
  const bad = [];
  for (const rule of rules) {
    if (!OUTLINE_OFF.test(rule.body)) continue;
    for (const part of selectorList(rule.selector)) {
      if (!visible.has(`${part}:focus-visible`)) {
        bad.push(`${part} 压掉了轮廓却没有 ${part}:focus-visible 补回来`);
      }
    }
  }
  return bad;
}

/* ── 模板扫描：带 onclick 的开标签 ── */
const TAG_RE = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>'"])*)>/g;
const NATIVE_CLICKABLE = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary', 'label']);

function onclickTags(src) {
  const out = [];
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(src))) {
    if (!/\bonclick\s*=/.test(m[2])) continue;
    out.push({ tag: m[1].toLowerCase(), attrs: m[2], line: src.slice(0, m.index).split('\n').length });
  }
  return out;
}

/* 只收「点空白处关闭」：这类元素不该进 Tab 序列（进去只是让人多按一次无意义的停点），
   但必须有键盘等价路径。下面 ESCAPE_PROOF 会核对 app.js 里真的有那条 Escape 分支。 */
const SCRIMS = new Map([
  ['modal-overlay', 'closeModal()'],
  ['qnav-scrim', 'toggleQnav(false)']
]);

/* 另一类：markup 还在、但根本没渲染出来，鼠标也点不到，所以谈不上键盘可达性。
   这里不是放过它，而是换一条更严的断言——证明它确实是死的（CSS 恒 display:none、
   没有任何代码给它加 open）。侧栏遮罩属于早期 mobile 抽屉的残留，删除归 REL-03/REL-04，
   在那之前先由这条断言钉住：谁要是把它重新点亮，就得同时补键盘路径，否则这里会红。 */
const INERT = new Map([
  ['sidebar-overlay', 'sidebarOverlay']
]);

function clickOffenses(src, file) {
  const tags = onclickTags(src);
  /* 扫描器自证：漏掉一个标签就等于漏掉一处可能不可达的点击 */
  const total = (src.match(/\bonclick\s*=/g) || []).length;
  assert.equal(tags.length, total, `${file}: 标签扫描器漏了 ${total - tags.length} 处 onclick，先修扫描器再谈规则`);

  const bad = [];
  for (const { tag, attrs, line } of tags) {
    if (NATIVE_CLICKABLE.has(tag)) continue;
    const cls = (/\bclass\s*=\s*"([^"]*)"/.exec(attrs) || [, ''])[1];
    const first = cls.split(/\s+/)[0];
    if (SCRIMS.has(first)) {
      const action = SCRIMS.get(first);
      if (!attrs.includes(action)) bad.push(`${file}:${line} ${first} 的关闭动作变了，白名单要跟着改`);
      continue;
    }
    if (INERT.has(first)) {
      if (!attrs.includes(INERT.get(first))) bad.push(`${file}:${line} ${first} 的 id 变了，惰性断言要跟着改`);
      continue;
    }
    const hasTab = /\btabindex\s*=/.test(attrs);
    const hasRole = /\brole\s*=/.test(attrs);
    /* 选项行的键盘路径是 document 级委托（optionKeydown），不写在标签上 */
    const delegated = /class="[^"]*\boption-item\b/.test(attrs) && /data-option-index=/.test(attrs);
    const hasKey = /\bonkeydown\s*=|\bonkeyup\s*=|\bonkeypress\s*=/.test(attrs) || delegated;
    if (!hasTab || !hasRole || !hasKey) {
      bad.push(`${file}:${line} <${tag} class="${cls}"> 可点但键盘走不到（tabindex=${hasTab} role=${hasRole} key=${hasKey}）`);
    }
  }
  return bad;
}

const css = read('web/style.css');
const app = read('web/app.js');
const html = read('web/index.html');

check('每一处 outline:none 都有同选择器的 :focus-visible 把环画回来', () => {
  assert.deepEqual(outlineOffenses(css), []);
});

check('CSS 与内联样式里没有 transition: all', () => {
  const bad = [];
  cssRules(css).forEach((rule) => {
    if (TRANSITION_ALL.test(rule.body)) bad.push(`style.css ${rule.selector}`);
  });
  for (const [file, src] of [['app.js', app], ['index.html', html]]) {
    src.split('\n').forEach((line, i) => {
      if (/style\s*=\s*"[^"]*\btransition\s*:\s*all\b/i.test(line)) bad.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(bad, []);
});

check('可点的非原生元素都有 role + tabindex + 键盘路径，例外全在显式名单里', () => {
  assert.deepEqual([...clickOffenses(app, 'app.js'), ...clickOffenses(html, 'index.html')], []);
});

check('遮罩的键盘等价路径真的存在：Escape 先关弹窗、再关答题卡', () => {
  const handler = /document\.addEventListener\('keydown',\s*\(e\)\s*=>\s*\{([\s\S]*?)\n\}\);/.exec(app);
  assert.ok(handler, 'app.js 里必须有 document 级 keydown');
  const body = handler[1];
  assert.match(body, /e\.key\s*!==\s*'Escape'/, '非 Escape 要转给 optionKeydown');
  assert.match(body, /optionKeydown\(e\)/, '选项行的键盘路径是委托的，不能删');
  assert.match(body, /closeModal\(\)/, 'Escape 要能关弹窗（modal-overlay 的等价路径）');
  assert.match(body, /toggleQnav\(false\)/, 'Escape 要能关答题卡（qnav-scrim 的等价路径）');
});

check('INERT 名单里的残留 markup 确实是死的：恒 display:none，且只有它自己会调那个开关', () => {
  for (const [cls, id] of INERT) {
    const rules = cssRules(css).filter((r) => selectorList(r.selector).includes(`.${cls}`));
    assert.ok(rules.length > 0, `.${cls} 的 CSS 规则不见了，名单要跟着改`);
    for (const rule of rules) {
      assert.match(rule.body, /display\s*:\s*none/, `.${cls} 在 ${rule.selector} 下不再是 display:none`);
    }
    /* 唯一能点亮它的函数，除了定义处就只剩这颗死元素自己的 onclick：没有别的入口 */
    const fn = new RegExp(`onclick="([A-Za-z_$][\\w$]*)\\(\\)"[^>]*`).exec(
      html.split('\n').find((l) => l.includes(`id="${id}"`)) || ''
    );
    assert.ok(fn, `${id} 的 onclick 形状变了，惰性证明要重写`);
    const name = fn[1];
    const hits = [...app.matchAll(new RegExp(`\\b${name}\\b`, 'g'))].length
      + [...html.matchAll(new RegExp(`\\b${name}\\b`, 'g'))].length;
    assert.equal(hits, 2, `${name} 多了调用点（${hits} 处），.${cls} 可能已经被点亮，必须补键盘路径`);
  }
});

check('两处向导步骤条都是原生 button，走不到的步骤 disabled，且有焦点环', () => {
  const rails = app.match(/<button type="button" class="wiz-step[^>]*>/g) || [];
  assert.equal(rails.length, 2, 'nsRail 与 aiRailHTML 各一处');
  for (const tag of rails) {
    assert.match(tag, /aria-label="\$\{label\}"/, '窄屏藏了可见文字，按钮必须自带名字');
    assert.match(tag, /: ' disabled'/, '不可点的步骤要真的 disabled，不是只把 onclick 去掉');
    assert.match(tag, /aria-current="step"/);
  }
  assert.ok(!/role="listitem" class="wiz-step/.test(app), '步骤条不该再退回 div + listitem');
  assert.ok(/\.wiz-step:focus-visible\s*\{[^}]*outline\s*:\s*2px solid/.test(stripCssComments(css)), '步骤按钮要有焦点环');
  /* 换成 button 之后必须把 UA 默认值压回去，否则整条步骤栏会矮一截 */
  const stepRule = cssRules(css).find((r) => r.selector === '.wiz-step');
  assert.ok(stepRule, '.wiz-step 规则要在');
  assert.match(stepRule.body, /appearance:\s*none/);
  assert.match(stepRule.body, /line-height:\s*1\.6/);
});

/* ── 反面样本：规则抓不住就等于没规则 ── */
check('守卫有效：反面写法抓得住，正当写法不误伤', () => {
  assert.equal(outlineOffenses('.x { outline: none; }').length, 1);
  assert.equal(outlineOffenses('.x { outline: none; } .x:focus-visible { outline: none; }').length, 1);
  assert.equal(outlineOffenses('.x, .y { outline: none; } .x:focus-visible { outline: 2px solid red; }').length, 1);
  assert.equal(outlineOffenses('.x { outline: none; } .x:focus-visible { outline: 2px solid red; }').length, 0);
  assert.equal(outlineOffenses('.x { outline: none; } .x:focus-visible { outline-color: red; }').length, 0);
  /* 注释里正当地提到 outline:none / transition: all，不算违规 */
  assert.equal(outlineOffenses('/* 这里保留 outline:none 是为了压掉默认环 */\n.x { color: red; }').length, 0);
  assert.equal(TRANSITION_ALL.test(stripCssComments('/* transition: all 会把环带上 */\n.x { transition: color .1s; }')), false);
  /* @media 里的嵌套规则也要扫到 */
  assert.equal(outlineOffenses('@media (max-width: 600px) { .x { outline: none; } }').length, 1);
  assert.equal(outlineOffenses('@media (max-width: 600px) { .x { outline: none; } .x:focus-visible { outline: 2px solid red; } }').length, 0);

  const bad = clickOffenses('<div class="thing" onclick="go()">x</div>', 't.js');
  assert.equal(bad.length, 1);
  assert.equal(clickOffenses('<button onclick="go()">x</button>', 't.js').length, 0);
  assert.equal(clickOffenses('<div role="button" tabindex="0" onclick="go()" onkeydown="k(event)">x</div>', 't.js').length, 0);
  assert.equal(clickOffenses('<div role="button" tabindex="0" onclick="go()">x</div>', 't.js').length, 1);
  assert.equal(clickOffenses('<div class="modal-overlay" onclick="if(event.target===this) closeModal()">x</div>', 't.js').length, 0);
  assert.equal(clickOffenses('<div class="modal-overlay" onclick="somethingElse()">x</div>', 't.js').length, 1);
  /* 惰性残留：id 对得上才放过，换了 id 就说明名单过期了 */
  assert.equal(clickOffenses('<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()">x</div>', 't.js').length, 0);
  assert.equal(clickOffenses('<div class="sidebar-overlay" id="other" onclick="toggleSidebar()">x</div>', 't.js').length, 1);
});

console.log(`\n${passed} a11y checks passed`);