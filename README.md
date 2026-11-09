# 智题 StarQuiz

把备考资料变成练习：上传笔记、讲义与真题，由 AI 出题，用学习模式查漏补缺、用考试模式自检掌握度，错题自动收进错题本。

和 [Exam Plan AI](https://github.com/mengqi-Su/exam-plan-model) 是一对：那边排"每天学什么"，这边负责"学到了没"。所有练习科目、题目、作答记录、错题都只存在**你自己的浏览器**里。

## 功能

- **练习科目**：一门科目下管理资料、练习集与做题记录；新建向导三步——考试信息 → 资料 → 完成，也可以先建科目稍后再传。
- **AI 出题**：从上传的资料或粘贴的文本生成选择题，支持题型、难度、题量与知识点的组合设置。
- **学习模式**：逐题作答、即时判对错、显示解析与考点提示，进度按题推进。
- **考试模式**：倒计时、一次性提交、交卷后按知识点给复盘报告。
- **错题本**：自动收录答错的题，可只练错题、按考点筛选、重做后移出。
- **AI 出题与编程题判题**：代码题走 Judge0 代理运行，返回用例结果。
- **与 Exam Plan 联动**：从备考规划点「练这个考点」带参数跳过来，考试、资料与真题原文一起交接。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | 原生 JavaScript（无框架、无构建），`web/` 目录即发布产物 |
| 样式 | 手写 CSS，设计标尺集中在 `web/style.css` 末尾 |
| 存储 | localStorage（科目 / 练习集 / 错题 / 设置 / 联动关系） |
| 文档解析 | 页面内自带 `pdf.js`、`mammoth`、`JSZip`（`web/vendor/`） |
| 云函数 | Deno（`functions/`）：模型调用、Judge0 代理、请求校验与限流 |
| 模型 | DeepSeek Chat Completions API |
| 部署 | Qoder Sites |

没有构建步骤是这个项目的刻意选择：改完 `web/*.js` 刷新即可，线上就是仓库里的文件。

## 快速开始

```bash
node dev/serve.mjs        # http://127.0.0.1:4401/web/index.html
```

只想看页面的话，用任何静态服务器指向 `web/` 也行，但 `dev/serve.mjs` 会把仓库根目录一起摊开，方便跑回归页面。

线上部署时发布目录是 `web/`，云函数在 `functions/`。

### 云函数环境变量

密钥只在云函数运行时读取，不要写进前端。

| 变量 | 作用 |
| --- | --- |
| `DEEPSEEK_API_KEY` / `API_KEY` | 模型密钥，前者优先 |
| `DEEPSEEK_MODEL` | 可选，覆盖默认模型 |
| `JUDGE0_URL` / `JUDGE0_KEY` / `JUDGE0_TOKEN` | 代码题判题服务；不配则判题不可用 |

### 接口

```
POST /ai/generate     从资料生成题目
POST /ai/start        生成会话的预检查与准备
POST /judge/run       代码题运行（Judge0 代理）
```

所有接口都过 `requestGuard`：AI 与判题分桶限流（突发、按分钟回填、按天上限），并校验请求体大小与字段。

## 回归与自检

```bash
node dev/a11y-smoke.mjs        # 键盘可达性与焦点指示的静态守卫
node dev/design-scale.mjs      # 字阶、圆角、对比度三条底线
node dev/function-smoke.mjs    # 云函数冒烟
```

- `dev/xss-regression.html`：打开后跑注入回归。站内大量内联事件依赖 CSP 里的 `'unsafe-inline'`，所以转义防线由 `esc()` 负责，这个页面就是它的守卫。

## 目录结构

```
web/
  index.html       应用外壳（侧栏 / 页头 / 主内容区）
  app.js           全部视图、状态与交互
  style.css        全部样式，设计标尺在文件末尾
  i18n.js          中英文案
  doc-text.js      文档文本抽取（pdf / docx / pptx / txt）
  upload-queue.js  上传队列与解析进度
  topicKey.js      考点键（与 Exam Plan 同一张向量表）
  vendor/          pdf.js、mammoth、JSZip 及其 cmaps
functions/
  index.ts         Deno 入口
  handler.ts       路由、Judge0 代理、请求体校验
  deepseek.ts      模型调用与模型回退
  requestGuard.ts  限流与访问控制
dev/               静态自检、XSS 回归、函数冒烟、本地静态服务器
```

## 设计约定

- 与 Exam Plan AI 共用同一套标尺：系统字体栈、字阶 24 / 20 / 15 / 13 / 12 / 11、圆角 8 / 12 / 999。
- 刷题页按试卷排：题干是主内容，选项是横排纸面条目，不是一叠悬浮卡片。
- 选项是可聚焦的 radio / checkbox，键盘能 Tab 到、Enter/Space 能作答。
- 焦点环只有一处出处，组件里不抹轮廓。

## 已知限制

- 数据只在本浏览器，换设备或清理站点数据不会自动同步。
- AI 出题与判题依赖云函数里的密钥与 Judge0 配置，本机不跑云函数时这些入口不可用。
- 线上 CSP 里的 `'unsafe-inline'` 是现状妥协（站内内联事件依赖它），注入防线靠转义与回归页面守着。
