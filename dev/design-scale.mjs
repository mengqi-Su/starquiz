// 设计标尺的底线，一次性检查：node dev/design-scale.mjs
//   1) 字号只有一把标尺：读字档 11 / 12 / 13 / 15 / 20 / 24，显示档 28 / 30 / 36 / 48 / 64 只给
//      文档页头、页图标和统计数字。写 14、17、19、22 这类中间值等于让每个新页面重新决定字号。
//   2) 圆角只有三档：控件 8 / 卡片 12 / 弹窗 16，chip 与圆点用 999。
//      --radius-lg / --radius-xl / --radius 这类同值别名也要一起收掉，多一个名字就多一次选择。
//   3) 颜色与装饰：过不了对比度的旧灰不许回来；大写字距装饰归零，层级靠字号、字重、颜色表达。
//   4) 封面带下沿是一段收边（渐隐到透明），不是一条硬边：不描边、不投影。
//   5) 弹窗页头只有眉栏和标题，不挂解释灰字；眉栏与底栏的状态读数不算说明文。
// 与 Exam Plan 的 dev/design-scale.test.ts 是同一条标尺（清单 UI-04）。两端各写一遍迟早漂移，
// 所以档位、退役色、对比度算术都照抄同一份；这里只把「Tailwind 任意值」换成本站的「字面 CSS 声明」。
// 第 5 条在 Exam Plan 那边住在 dev/copy-guard.test.ts（文案规则归文案守卫），口径一样。
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const passed = [];
async function check(name, fn) {
  fn();
  passed.push(name);
  console.log(`  ok  ${name}`);
}

const READING_TIERS = [11, 12, 13, 15, 20, 24];
const DISPLAY_TIERS = [28, 30, 36, 48, 64];
const LADDER = new Set([...READING_TIERS, ...DISPLAY_TIERS]);

/* 圆角：控件 8 / 卡片 12 / 弹窗 16 / chip·圆点 999 / 圆形 50% / 无 0 */
const RADIUS_OK = /^(0|8px|12px|16px|999px|50%|var\(--radius-(?:input|card|modal)\))$/;

const RETIRED = ['#111111', '#333333', '#666666', '#777777', '#888888', '#999999', '#cccccc',
  '#a39e97', '#8a8580', '#a6a298', '#c5c1b8', '#fcd33b', '#282828', '#9a1d14'];

/* 注释里正当地提到退役色是交代原因（「原来的 #8a8580 只有 3.41」），先按行保形挖掉再查。 */
function maskComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blank);
  out = out.replace(/(^|[^:\\])(\/\/[^\n]*)/gm, (_all, pre, comment) => pre + blank(comment));
  return out.replace(/<!--[\s\S]*?-->/g, blank);
}

const styleFiles = (() => {
  const keep = [];
  for (const entry of readdirSync('web')) {
    if (entry === 'vendor') continue;                       // 第三方库不归本站标尺管
    if (/\.(css|js|html)$/.test(entry)) keep.push(join('web', entry));
  }
  return keep.sort();
})();

const read = (f) => maskComments(readFileSync(f, 'utf8'));

/* ---------- 1. 字号 ---------- */
const sizeOffenses = (src) => {
  const bad = [];
  src.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/font-size:\s*([0-9.]+)(px|rem|em|%)/g)) {
      const v = Number(m[1]);
      if (m[2] !== 'px') bad.push(`${i + 1}: ${m[0]} → 字号只写 px`);
      else if (!LADDER.has(v)) bad.push(`${i + 1}: ${m[0]} 不在标尺上 |${line.trim().slice(0, 80)}`);
    }
    for (const m of line.matchAll(/clamp\(\s*([0-9.]+)px[^,)]*,[^,)]*,\s*([0-9.]+)px\s*\)/g)) {
      if (!LADDER.has(Number(m[1])) || !LADDER.has(Number(m[2]))) {
        bad.push(`${i + 1}: ${m[0]} → clamp 两端也要在标尺上`);
      }
    }
  });
  return bad;
};

check('字号全在标尺上：读字 11/12/13/15/20/24，显示 28/30/36/48/64', () => {
  const bad = styleFiles.flatMap((f) => sizeOffenses(read(f)).map((b) => `${f} ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
  /* 显示档不许当正文用：组件里出现 36 以上只有页图标与统计数字那几处 */
  const big = [];
  for (const f of styleFiles) {
    read(f).split(/\r?\n/).forEach((line, i) => {
      const m = /font-size:\s*(36|48|64)px/.exec(line);
      if (m) big.push(`${f}:${i + 1} ${m[0]}`);
    });
  }
  assert.ok(big.length <= 6, `显示档字号扩散了（${big.length} 处）：\n${big.join('\n')}`);
});

/* ---------- 2. 圆角 ---------- */
const radiusOffenses = (src) => {
  const bad = [];
  src.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/border-radius:\s*([^;}"']+)/g)) {
      const value = m[1].trim();
      const parts = value.split(/\s+/).filter(Boolean);
      const wrong = parts.filter((p) => !RADIUS_OK.test(p));
      if (wrong.length) bad.push(`${i + 1}: border-radius: ${value} → 只有 8 / 12 / 16 / 999 / 50% / 0`);
    }
    if (/--radius(?:-lg|-xl)?\s*:/.test(line) || /var\(--radius(?:-lg|-xl)\)/.test(line)) {
      bad.push(`${i + 1}: 圆角别名又回来了 → 只用 --radius-input / --radius-card / --radius-modal`);
    }
  });
  return bad;
};

check('圆角三档：控件 8 / 卡片 12 / 弹窗 16，chip 用 999，别名不复活', () => {
  const bad = styleFiles.flatMap((f) => radiusOffenses(read(f)).map((b) => `${f} ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

/* ---------- 3. 装饰与颜色 ---------- */
const decorationOffenses = (src) => {
  const bad = [];
  src.split(/\r?\n/).forEach((line, i) => {
    if (/text-transform:\s*uppercase/.test(line)) bad.push(`${i + 1}: 大写装饰 |${line.trim().slice(0, 80)}`);
    const m = /letter-spacing:\s*0\.([0-9]+)em/.exec(line);
    if (m && Number(`0.${m[1]}`) > 0.03) bad.push(`${i + 1}: 正向大字距 ${m[0]} → 小标签一律 -0.012em`);
    if (/<span[^>]*>\s*·\s*<\/span>/.test(line)) bad.push(`${i + 1}: · 当分隔符写成了独立元素`);
  });
  return bad;
};

check('装饰归零：没有大写徽标、正向大字距，· 不单独成元素', () => {
  const bad = styleFiles.flatMap((f) => decorationOffenses(read(f)).map((b) => `${f} ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

/* 只有「写在样式位置上」的颜色才是样式：CSS 声明、内联 style、SVG 的 fill/stroke。
   封面预设里的 bar: '#a39e97' 是装饰图形的调色数据，不是 UI 组件的颜色，位置检查天然放过它——
   这正是上一版按整串文本查的写法会误伤的地方（误伤一次就会有人把守卫删掉）。 */
const STYLE_BEFORE = /(?:color|background|background-color|border(?:-\w+)*-color|outline-color|box-shadow|stop-color|caret|fill|stroke)\s*[:=]\s*["']?(?:(?:linear|radial)-gradient\()?\s*$/i;
const colorOffenses = (src) => {
  const bad = [];
  src.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
      const hex = `#${m[1].toLowerCase()}`;
      if (!RETIRED.includes(hex)) continue;
      if (!STYLE_BEFORE.test(line.slice(0, m.index))) continue;
      bad.push(`${i + 1}: 样式位置上的退役色 ${hex} |${line.trim().slice(0, 80)}`);
    }
  });
  return bad;
};

check('退役灰没有回到样式位置上（挖掉注释后再查）', () => {
  const bad = styleFiles.flatMap((f) => colorOffenses(read(f)).map((b) => `${f} ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

/* ---------- 4. 对比度：数字由这段算术现算，不许手填 ---------- */
const lum = (hex) => {
  const c = hex.replace('#', '');
  const n = c.length === 3 ? c.split('').map((x) => x + x) : c.match(/../g);
  const [r, g, b] = n.map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fg, bg) => {
  const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

check('文字对比度：每对前景/背景都按 WCAG 现算，正文档 ≥4.5', () => {
  const table = [
    ['#1c1b1a', '#f8f7f4', 4.5, '墨 / 纸（正文）'],
    ['#1c1b1a', '#ffffff', 4.5, '墨 / 卡面'],
    ['#1c1b1a', '#f1efe9', 4.5, '墨 / chip 底'],
    ['#1c1b1a', '#faf9f6', 4.5, '墨 / 悬停面'],
    ['#6b6660', '#f8f7f4', 4.5, '次级灰 / 纸（12 元信息）'],
    ['#6b6660', '#ffffff', 4.5, '次级灰 / 卡面'],
    ['#6b6660', '#f1efe9', 4.5, '次级灰 / chip 底'],
    ['#6b6660', '#faf9f6', 4.5, '次级灰 / 悬停面'],
    ['#6b6660', '#f2f0ea', 4.5, '次级灰 / 侧栏底'],
    ['#ffffff', '#1c1b1a', 4.5, '白字 / 墨底按钮'],
    ['#ffffff', '#3a3937', 4.5, '白字 / 墨底按钮悬停'],
    ['#ffffff', '#b42318', 4.5, '白字 / 危险红'],
    ['#b42318', '#ffffff', 4.5, '危险红 / 卡面'],
    ['#b42318', '#fdf0ee', 4.5, '危险红 / 红底提示'],
    ['#8a5a00', '#ffffff', 4.5, '琥珀 / 卡面'],
    ['#8a5a00', '#fff6dd', 4.5, '琥珀 / 琥珀底'],
    ['#3f6b4f', '#ffffff', 4.5, '墨绿 / 卡面'],
    ['#3f6b4f', '#eef4ef', 4.5, '墨绿 / 绿底提示'],
    ['#3f6b4f', '#f1efe9', 4.5, '墨绿 / chip 底'],
  ];
  const weak = table
    .map(([fg, bg, min, name]) => ({ name, got: contrast(fg, bg), min }))
    .filter((r) => r.got < r.min)
    .map((r) => `${r.name} 只有 ${r.got.toFixed(2)}，要求 ${r.min}`);
  assert.deepEqual(weak, [], `\n${weak.join('\n')}`);
});

/* 描边类图形低于 3:1 是已知且记录在案的例外（清单 UI-03）：
   输入框、卡片、虚线上传区都只靠 2px 墨色焦点环表达「可操作」，
   环本身 17.20:1。这里把它们钉住，避免哪天被当成合格图形继续扩散。 */
check('图形例外只有描边一族，且焦点环比它们都深', () => {
  const strokes = ['#eae7e1', '#f0ede8', '#e5e2dc', '#d8d4cc', '#ddd8d0', '#cfc9c0', '#bdb8ae'];
  for (const s of strokes) assert.ok(contrast(s, '#ffffff') < 3, `${s} 已够深，该按 3:1 纳入正式图形了`);
  assert.ok(contrast('#1c1b1a', '#ffffff') > 15, '焦点环是墨色，比所有描边都深');
});

/* ---------- 5. 封面带下沿：不许是一条硬边 ---------- */
/* 封面带和正文断成两块，是因为带子有个明确的下沿。收边的做法是把最后一段渐隐到透明，
   露出页面自己的纸色——用 mask 而不是叠一层纸色渐变，纸色才只有一处出处（body 的 --paper），
   换底色 / 做深色主题时这里不用跟着改第二遍。规则按值查，不查历史：
   只要 .ui-cover-band 没有以 transparent 收尾的 mask，或者自己描了边 / 带了投影，就算硬边。 */
const coverBandBlocks = (css) => {
  const blocks = [];
  for (const m of css.matchAll(/([^{}]*\.ui-cover-band[^{}]*)\{([^{}]*)\}/g)) {
    blocks.push({ selector: m[1].trim(), body: m[2] });
  }
  return blocks;
};
const WASHED = /(?:-webkit-)?mask-image:\s*linear-gradient\([^;]*,\s*transparent(?:\s+100%)?\s*\)/;
/* 先取值再判断：写成 `border:\s*(?!0\b)` 会被 \s* 的回溯绕过——
   零空白那一轮 lookahead 看到的是「 0」而不是「0」，于是 border:0 被误判成描边。 */
const declOf = (body, prop) => {
  const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:([^;]*)`).exec(body);
  return m ? m[1].trim() : '';
};
const EMPTY_EDGE = /^(?:0(?:px)?|none)(?:\s+(?:0(?:px)?|none))*$/;
const coverSeamOffenses = (css) => {
  const blocks = coverBandBlocks(css);
  if (!blocks.length) return ['.ui-cover-band 不见了：收边规则无处落地'];
  const bad = [];
  if (!blocks.some((b) => WASHED.test(b.body))) {
    bad.push('封面带下沿是硬边：需要一段以 transparent 收尾的 mask-image 渐隐');
  }
  for (const b of blocks) {
    for (const prop of ['border', 'border-bottom']) {
      const v = declOf(b.body, prop);
      if (v && !EMPTY_EDGE.test(v)) bad.push(`封面带描了边 → ${b.selector} { ${prop}: ${v} }`);
    }
    const v = declOf(b.body, 'box-shadow');
    if (v && !EMPTY_EDGE.test(v)) bad.push(`封面带带了投影 → ${b.selector} { box-shadow: ${v} }`);
  }
  return bad;
};

check('封面带下沿是收边不是硬边：渐隐到透明，且不描边不投影', () => {
  const bad = styleFiles
    .filter((f) => f.endsWith('.css'))
    .flatMap((f) => coverSeamOffenses(read(f)).map((b) => `${f}: ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

/* ---------- 6. 弹窗页头：只有眉栏和标题，不挂解释灰字 ---------- */
/* 眉栏（「练习题库」「已存 N 门」）是状态读数，留着；「标题下面一句说明」是说明文，清掉。
   槽连同样式一起删——槽留着，下一个弹窗就会顺手填一句，这已经是第二次长回来了。
   页头区段只取到紧随其后的 modal-body / modal-footer 为止：正文里的 <p>
   （确认弹窗的原因、练习集简介、结果页的未评分提示）都是内容或状态，不受牵连。 */
const headerExplanationOffenses = (src) => {
  const bad = [];
  if (/modal-desc/.test(src)) bad.push('解释槽 modal-desc 又回来了');
  for (const m of src.matchAll(/class="modal-header[^"]*"[\s\S]*?class="modal-(?:body|footer)/g)) {
    if (/<p[\s>]/.test(m[0])) bad.push('弹窗页头里塞了一段 <p> 说明');
  }
  return bad;
};

check('弹窗页头只有眉栏和标题，没有解释灰字', () => {
  const bad = styleFiles.flatMap((f) => headerExplanationOffenses(read(f)).map((b) => `${f}: ${b}`));
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

/* ---------- 7. 守卫自己：反面写法要抓得住，正当写法不许误伤 ---------- */
check('守卫有效：反面样本抓得住，正当样本不误伤', () => {
  /* 字号 */
  assert.ok(sizeOffenses('.a { font-size: 14px }').length === 1, '14px 必须被抓到');
  assert.ok(sizeOffenses('.a { font-size: 13.5px }').length === 1, '小数档必须被抓到');
  assert.ok(sizeOffenses('.a { font-size: 0.8125rem }').length === 1, 'rem 必须被抓到');
  assert.ok(sizeOffenses('.a { font-size: clamp(58px, 11vw, 78px) }').length === 1, 'clamp 两端不在阶上要被抓到');
  assert.equal(sizeOffenses('.a { font-size: clamp(48px, 9vw, 64px) }').length, 0);
  assert.equal(sizeOffenses('.a { font-size: 13px; line-height: 1.6 }').length, 0);
  /* 圆角：多个值要逐段查，不能整串放过 */
  assert.equal(radiusOffenses('.a { border-radius: 10px }').length, 1);
  assert.equal(radiusOffenses('.a { border-radius: 12px 0 0 12px }').length, 0, '分段写法合法');
  assert.equal(radiusOffenses('.a { border-radius: 10px 0 0 10px }').length, 1);
  assert.equal(radiusOffenses('.a { border-radius: var(--radius-card) }').length, 0);
  assert.equal(radiusOffenses('.a { border-radius: 8px } .b { border-radius: 999px }').length, 0);
  assert.equal(radiusOffenses('--radius-lg: 12px;').length, 1, '别名声明要被抓到');
  /* 装饰 */
  assert.equal(decorationOffenses('.a { text-transform: uppercase }').length, 1);
  assert.equal(decorationOffenses('.a { letter-spacing: 0.08em }').length, 1);
  assert.equal(decorationOffenses('.a { letter-spacing: 0.02em }').length, 0, '正常微调不误伤');
  assert.equal(decorationOffenses('.a { letter-spacing: -0.012em }').length, 0, '负字距不误伤');
  assert.equal(decorationOffenses('<span class="x">·</span>').length, 1);
  assert.equal(decorationOffenses('<span>3 个练习集 · 12 道题</span>').length, 0, '句内分隔符不算装饰');
  /* 颜色：注释里的退役色是交代原因，代码里的才算违规 */
  assert.equal(colorOffenses('color: #8a8580;').length, 1);
  assert.equal(colorOffenses('style="color:#8a8580"').length, 1);
  assert.equal(colorOffenses('background: linear-gradient(#333333, #1c1b1a)').length, 1);
  assert.equal(colorOffenses('/* 原来 #8a8580 只有 3.41 */\ncolor: #6b6660;').length, 0);
  assert.equal(colorOffenses('background: #3a3937;').length, 0);
  assert.equal(colorOffenses("{ bg: 'var(--paper-2)', bar: '#a39e97' }").length, 0, '封面调色板是图形数据，不是样式位置');
  /* 封面收边：硬边、描边、投影、假收边都要抓住，正当的 mask 不误伤 */
  assert.equal(coverSeamOffenses('.ui-cover-band { height: 240px; }').length, 1, '没有收边就是硬边');
  assert.equal(coverSeamOffenses('.ui-cover-band { mask-image: linear-gradient(to bottom, #000, #f8f7f4); }').length, 1, '渐隐到实色不算收边，下沿还在');
  assert.equal(coverSeamOffenses('.ui-cover-band { border-bottom: 1px solid #eae7e1; mask-image: linear-gradient(to bottom, #000 58%, transparent); }').length, 1);
  assert.equal(coverSeamOffenses('.ui-cover-band { box-shadow: 0 1px 2px rgba(0,0,0,.1); mask-image: linear-gradient(to bottom, #000 58%, transparent); }').length, 1);
  assert.equal(coverSeamOffenses('').length, 1, '整条规则被删掉也要报');
  assert.equal(coverSeamOffenses('.ui-cover-band { mask-image: linear-gradient(to bottom, #000 58%, transparent 100%); }').length, 0);
  assert.equal(coverSeamOffenses('.ui-cover-band { -webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent); mask-image: linear-gradient(to bottom, #000 58%, transparent); border: 0; box-shadow: none; }').length, 0);
  assert.equal(coverSeamOffenses('.ui-cover-band { height: 240px; mask-image: linear-gradient(to bottom, #000 58%, transparent); } @media (max-width: 720px) { .ui-cover-band { height: 168px; } }').length, 0, '窄屏只改高度不算硬边');
  /* 弹窗页头解释句：槽和 <p> 各算一条；正文里的 <p> 不算 */
  assert.equal(headerExplanationOffenses('<div class="modal-header"><p class="modal-desc">先填考试信息。</p></div><div class="modal-body">').length, 2);
  assert.equal(headerExplanationOffenses('.modal-desc { color: var(--ink-mute); }').length, 1, '样式里留着槽也要报');
  assert.equal(headerExplanationOffenses('<div class="modal-header"><p>说明</p></div><div class="modal-footer">').length, 1, '换个类名照样是页头说明');
  assert.equal(headerExplanationOffenses('<div class="modal-header modal-header-rich"><div class="modal-eyebrow"><span>练习题库</span></div><div class="modal-title">新建科目</div></div><div class="modal-body"><p>正文里的一段</p></div>').length, 0);
  assert.equal(headerExplanationOffenses('<div class="modal-body"><p class="text-sm">确认原因</p></div>').length, 0, '没有页头就无从误伤');
  /* 对比度算术本身 */
  assert.ok(Math.abs(contrast('#1c1b1a', '#f8f7f4') - 16.05) < 0.05);
  assert.ok(contrast('#a39e97', '#ffffff') < 3, '退役浅灰本来就该不合格，否则这条规则没有意义');
  assert.ok(contrast('#ffffff', '#3a3937') > 4.5);
});

console.log(`\n${passed.length} design-scale checks passed`);
