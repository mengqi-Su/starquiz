/* 双语支持（对齐 Exam Plan AI 的「界面语言」）。
 *
 * 这个应用有 5000 多行模板字符串，逐条改成 t('key') 的风险远大于收益，
 * 所以以「渲染后的文本节点 + 可见属性」为翻译单位：源码只保留中文单语文案，
 * 英文模式下渲染完成后就地替换。中文即源语言，zh 模式零开销、零改动。
 *
 * 对外接口：getLang() / setLang(lang) / t(zh) / applyLang(root)
 */

const LANG_PREF_KEY = 'sq_lang';
const HAN = /[㐀-䶿一-鿿豈-﫿]/;
const LANG_ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'content'];
const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };

let _lang = 'zh';

/* ---------- 词典：中文原文 → 英文 ---------- */
/* 精确匹配以「文本节点去空格后的整体内容」为键，语序不同或含变量的句子走 EN_PATTERNS。
 * 用户数据（练习科目名、题干、资料名）不会出现在这里，英文模式下原样保留。 */
const EN = Object.assign({
  /* 文档头 */
  '智题 StarQuiz - 备考练习平台': 'StarQuiz - Focused practice for the exam you are preparing for',
  '把备考规划里的考试、资料和真题变成练习：学习模式查漏补缺，考试模式自检掌握度':
    'Turns the exam, materials and past papers from your study plan into practice: study mode closes gaps, exam mode checks mastery',

  /* 外壳：侧栏、导航、页头 */
  '智题 STARQUIZ': 'StarQuiz',
  '智题 StarQuiz': 'StarQuiz',
  '首页': 'Home',
  '练习科目': 'Practice subjects',
  '记录': 'Records',
  '进度': 'Progress',
  '设置': 'Settings',
  '主导航': 'Main navigation',
  '练习科目列表': 'Practice subject list',
  '收起侧栏': 'Collapse sidebar',
  '展开侧栏': 'Expand sidebar',
  '我的练习科目': 'My practice subjects',
  '新增练习科目': 'New practice subject',
  '＋ 新建': '＋ New',
  '还没有练习科目': 'No practice subjects yet',
  '未分类': 'Unfiled',
  'AI 生成': 'AI generate',
  '练习集详情': 'Question set',
  '学习进度': 'Progress',
  '考试结果': 'Exam result',
  '学习模式': 'Study mode',
  '考试模式': 'Exam mode',

  /* 通用动作 */
  '取消': 'Cancel',
  '确定': 'OK',
  '保存': 'Save',
  '删除': 'Delete',
  '移动': 'Move',
  '关闭': 'Close',
  '预览': 'Preview',
  '跳过': 'Skip',
  '完成': 'Done',
  '退出': 'Exit',
  '放弃': 'Discard',
  '重试': 'Retry',
  '清空': 'Clear',
  '重置': 'Reset',
  '重命名': 'Rename',
  '建立': 'Create',
  '返回': 'Back',
  '← 上一步': '← Back',
  '← 返回练习科目': '← Back to subjects',
  '返回练习科目': 'Back to subjects',
  '重新加载': 'Reload',
  '页面出了点问题': 'Something went wrong on this page',
  '你的数据没有被清除。建议先导出备份，再重新加载；如果反复出现，再考虑重置本地数据。':
    'Your data has not been cleared. Export a backup first, then reload; if it keeps happening, consider resetting local data.',
  '导出数据备份': 'Export a backup',
  '重置本地数据': 'Reset local data',
  '未知错误': 'Unknown error',

  /* 单位与统计片段 */
  '题': 'questions',
  '道题目': 'questions',
  '个练习集': 'question sets',
  '份资料': 'materials',
  '份': 'files',
  '个文件': 'files',
  '个字': 'characters',
  '提取文字': 'extracted text',
  '页': 'pages',
  '段': 'segments',
  '天': 'days',
  '秒': 's',
  '分': 'pts',
  '共': 'of',
  '已答': 'Answered',
  '答对': 'Correct',
  '答错': 'Wrong',
  '用时': 'Time',
  '正确率': 'Accuracy',
  '未作答': 'Unanswered',
  '待提交': 'To submit',
  '当前': 'Current',
  '未知': 'Unknown',
  '考试': 'Exam',
  '学习': 'Study',
  '题目': 'Questions',
  '知识点': 'Key points',
  '资料': 'Materials',
  '练习集': 'Question sets',
  '真题': 'Past papers',
  '笔记': 'Notes',
  '出题': 'Generate',
  '原样整理': 'Keep as is',
  '过滤': 'Filter',

  /* 题型 */
  '单选': 'Single choice',
  '多选': 'Multiple choice',
  '判断': 'True / false',
  '填空': 'Fill in the blank',
  '编程': 'Coding',
  '正确': 'True',
  '错误': 'False',
  '（未作答）': '(left blank)',
  '（空）': '(empty)',
  '混合题型': 'Mixed types',
  '仅选择题': 'Choice only',
  '含编程题': 'With coding',
  '题型分布': 'Type mix',
  '题型偏好': 'Question types',
  '题目数量': 'Question count',
  '题目范围': 'Question scope',
  '没有题目': 'No questions',
  '这个练习集还没有题目': 'This set has no questions yet',

  /* 首页 */
  '今日练习': "Today's practice",
  '今日目标': 'Daily goal',
  '去练习': 'Practice',
  '进入练习科目': 'Open subject',
  '还没有资料，点进去上传': 'No materials yet — open it to upload',
  '未练习': 'Not started',
  '去建第一个练习科目': 'Create your first practice subject',

  /* 练习科目页 */
  'AI 出题': 'AI questions',
  '＋ 上传资料': '＋ Upload materials',
  '上传资料': 'Upload materials',
  '删除练习科目': 'Delete subject',
  '重命名练习科目': 'Rename subject',
  '更改练习科目': 'Change subject',
  '移动练习集': 'Move question set',
  '目标练习科目': 'Target subject',
  '（未知练习集）': '(unknown set)',
  '删除练习集': 'Delete question set',

  /* 练习集详情 */
  '练习次数': 'Attempts',
  '最佳成绩': 'Best score',
  '进入学习模式': 'Start studying',
  '模拟考试': 'Mock exam',
  '随机 10 题': 'Random 10',
  '随机 20 题': 'Random 20',
  '完成学习': 'Finish session',
  '它可能已被删除': 'It may have been deleted',
  '练习集不存在': 'Question set not found',
  '练习科目不存在': 'Subject not found',

  /* 学习与考试流程 */
  '← 上一题': '← Previous',
  '下一题 →': 'Next →',
  '提交答案': 'Submit answer',
  '请先输入答案': 'Enter an answer first',
  '你的答案': 'Your answer',
  '你的答案：': 'Your answer: ',
  '正确答案：': 'Correct answer: ',
  '参考答案': 'Reference answer',
  '查看参考答案': 'View reference answer',
  '见参考答案': 'See reference answer',
  '运行测试': 'Run tests',
  '正在运行测试用例': 'Running test cases',
  '测试用例': 'Test cases',
  '输入': 'Input',
  '期望输出': 'Expected output',
  '运行结果': 'Result',
  '测试结果': 'Test result',
  '✓ 回答正确': 'Correct',
  '✕ 回答错误': 'Incorrect',
  '✓ 正确': 'Correct',
  '✕ 错误': 'Incorrect',
  '✓ 已提取': 'Extracted',
  '✓ 所有测试用例通过': 'All test cases passed',
  '✓ 全部通过': 'All passed',
  '✗ 部分用例未通过': 'Some cases failed',
  '全部测试通过，回答正确！': 'All tests passed — correct!',
  '这道题没有测试用例，暂不能自动判题': 'This question has no test cases, so it cannot be auto-graded',
  '答题卡': 'Question map',
  '收起答题卡': 'Collapse question map',
  '交卷': 'Submit exam',
  '开始考试': 'Start exam',
  '结束考试': 'End exam',
  '继续考试': 'Resume exam',
  '继续学习': 'Resume study',
  '再考一次': 'Try again',
  '返回练习集': 'Back to set',
  '练下一套': 'Next set',
  '查看记录': 'View history',
  '答题回顾': 'Answer review',
  '正在评分...': 'Grading…',
  '编程题正在运行测试用例，请稍候': 'Coding questions are still running their tests',
  '考试时长': 'Duration',
  '代码判题尚未启用，编程题不计分。': 'Code judging is not enabled — programming questions are not scored.',
  '没有结果': 'No result yet',
  '没有进行中的考试': 'No exam in progress',
  '这场考试没有可答的题目': 'This exam has no answerable questions',
  '这场考试已经超时，不能再继续了': 'This exam has timed out and can no longer continue',
  '未开始学习': 'Not started',
  '优秀': 'Excellent',
  '合格': 'Pass',
  '需要加强': 'Needs work',
  '— 未评分': '— Ungraded',
  '部分编程题因判题服务不可用而未评分': 'Some coding questions were left ungraded because the judge service was unavailable',

  /* 记录页 */
  '平均正确率': 'Average accuracy',
  '平均得分': 'Average score',
  '每次练习的得分均值': 'Mean score per session',
  '按练习集表现': 'Performance by set',
  '历史记录': 'History',
  '还没有练习记录，从学习模式开始吧': 'No practice records yet — start with study mode',

  /* 错题本 v2：考点收纳台 + 错题模拟（一级视图） */
  '错题本': 'Mistake book',
  '暂无错题': 'No mistakes to review',
  '考点收纳': 'Filed by key point',
  '未归类考点': 'Unfiled key point',
  '待复习': 'To review',
  '顽固错题': 'Stubborn mistakes',
  '已掌握': 'Mastered',
  '最弱考点': 'Weakest point',
  '未掌握': 'Open',
  '顽固': 'Stubborn',
  '全部': 'All',
  '排序': 'Sort',
  '先练顽固的': 'Stubborn first',
  '最近答错的': 'Most recently missed',
  '组一套错题模拟': 'Build a mistake mock',
  '只练这组': 'Practise this group',
  '移出': 'Remove',
  '重新列入': 'Bring back',
  '回到原练习集': 'Back to the original set',
  '今天可复习': 'Due today',
  '明天可复习': 'Due tomorrow',
  '还没有到复习时间': 'Nothing is due yet',
  '暂时没有反复错的题': 'No repeat mistakes yet',
  '答对一次即归档，可重新列入': 'Filed after one right answer — bring any back',
  '还没有归档的错题': 'Nothing archived yet',
  '先答错题才会形成考点画像': 'Miss a question and the profile starts here',
  '错过 3 次以上，每天都要见一面': 'Missed three times or more — they show up every day',
  '错题模拟': 'Mistake mock',
  '今日到期': 'Due today',
  '全部未掌握': 'All open mistakes',
  '重练错题': 'Redo mistakes',
  '回到错题本': 'Back to mistakes',
  '本次模拟的错题': 'Mistakes from this mock',
  '出题范围': 'Question pool',
  '混入新题': 'Mix in fresh questions',
  '不混 · 只考错题': 'No mixing — mistakes only',
  '混约 20% 没练过的题': 'About 20% questions you have not seen',
  '混约一半新题': 'About half new questions',
  '下一批还没到时间': 'The next batch is not due yet',
  '这一组暂时没有可练的错题': 'No mistakes to practise in this group right now',
  '错题本还是空的，先去做几套题': 'The mistake book is empty — do a few sets first',
  '这个范围里暂时没有错题': 'No mistakes in this pool yet',
  '这道题已移出错题本': 'Removed from the mistake book',
  '已重新列入待复习': 'Back on the review list',
  '（已删除的练习集）': '(deleted question set)',
  '按练习集分组': 'Grouped by question set',

  /* 设置页 */
  '界面语言': 'Language',
  '显示语言': 'Display language',
  'AI 出题 · 真题整理': 'AI questions · past-paper cleanup',
  '用 AI 新建练习集': 'Create a set with AI',
  '判题服务': 'Judge service',
  '数据管理': 'Data',
  '导出全部数据': 'Export all data',
  '导出 JSON': 'Export JSON',
  '导入数据备份': 'Import a backup',
  '选择文件': 'Choose file',
  '本地存储': 'Local storage',
  '清空练习记录': 'Clear practice history',
  '恢复初始状态': 'Reset to a clean state',
  '备考规划': 'Study planning',
  '粘贴课堂笔记、教材段落、真题试卷……': 'Paste lecture notes, textbook passages, exam papers…',
  'PDF · Word · PPT · TXT · 粘贴': 'PDF · Word · PPT · TXT · paste',
  'Exam Plan AI 备考规划': 'Exam Plan AI',
  '打开备考规划 ↗': 'Open Exam Plan AI ↗',
  '返回备考规划 ↗': 'Back to Exam Plan AI ↗',
  '带回备考规划 ↗': 'Send this result back ↗',

  /* 新增练习科目向导 */
  '练习科目名称': 'Practice subject name',
  '下一步：上传资料': 'Next: upload materials',
  '下一步：处理方式': 'Next: how to handle',
  '下一步：确认生成': 'Next: confirm',
  '下一步：完成': 'Next: finish',
  '拖入文件，或点击选择': 'Drop files here, or click to choose',
  /* 单独可拼进长文案的片段：整句查不到时由分段兜底逐段替换 */
  '没有文件？直接粘贴文字': 'No file? Paste text instead',
  '这段文字属于': 'This text belongs to',
  '笔记 · 生成新题': 'Notes · generate questions',
  '真题 · 原样整理': 'Past paper · keep as is',
  '例如：高等数学、英语写作、导游实务': 'e.g. Calculus, Essay writing, Tour guide practice',
  '练习科目名称不能为空': 'Subject name is required',
  '已经有同名练习科目了': 'A subject with this name already exists',

  /* AI 出题向导 */
  '处理方式': 'Handling',
  '生成练习集': 'Generate a set',
  '整理全部真题': 'Clean up the whole paper',
  '原样整理真题': 'Keep the past paper as is',
  '资料从哪来': 'Where the materials come from',
  '保存到练习科目': 'Save into subject',
  '笔记出题': 'From notes',
  '真题整理': 'From past papers',
  '笔记出题 · 真题原样保留': 'Notes become questions · past papers stay untouched',
  '根据资料出题': 'Generate from materials',
  '笔记 · 出题': 'Notes · generate',
  '真题 · 保留': 'Past paper · keep',
  '笔记资料': 'Note materials',
  '检测到试卷格式，点这里改为原样整理，题目全部保留 →':
    'Looks like an exam paper — click here to keep it as is and preserve every question →',
  '将全部整理': 'Everything will be kept',
  '确认并生成': 'Confirm and generate',
  '保存前会先给你看结果': 'You review the result before it is saved',
  '开始整理': 'Start cleanup',
  '等待资料': 'Waiting for materials',
  '正在解析': 'Parsing',
  '正在解析…': 'Parsing…',
  '正在解析资料…': 'Reading your materials…',
  '解析失败': 'Parsing failed',
  /* 资料读取队列：三个入口共用一套说法，英文也就只有一套 */
  '排队中': 'Queued',
  '读取中': 'Reading',
  '读不出': 'Not readable',
  '没读': 'Not read',
  '还没读': 'Not read yet',
  '留到下一批': 'Next batch',
  '收起': 'Dismiss',
  '资料还在解析中，请稍候': 'Materials are still being parsed — hold on',
  '资料还在解析中，先等它结束': 'Materials are still parsing — let it finish first',
  '收起粘贴框': 'Hide the paste box',
  '全部按笔记': 'All as notes',
  '全部按真题': 'All as past papers',
  '粘贴的文字': 'Pasted text',
  '未命名资料': 'Untitled material',
  '来源：粘贴文字': 'Source: pasted text',
  '查看提取的文字': 'View extracted text',
  '下载': 'Download',
  '下载原文件': 'Download the file',
  '导出文字': 'Export text',
  '先上传或粘贴至少 50 字的资料': 'Upload or paste at least 50 characters first',
  '资料还不能用，请检查上面的提示': 'The material is not ready yet — check the hints above',
  '请先上传资料或粘贴文字（至少 50 字）': 'Upload a file or paste at least 50 characters first',
  '笔记和真题都需要至少 50 字才能一起整理': 'Notes and past papers each need at least 50 characters to be cleaned together',
  '直接 AI 出题': 'Generate with AI directly',
  '生成成功': 'Generated',
  '整理完成': 'Cleaned up',
  '生成失败': 'Generation failed',
  '整理失败': 'Cleanup failed',
  '重新生成': 'Generate again',
  '重新整理': 'Clean up again',
  '生成中…': 'Generating…',
  '整理中…': 'Cleaning up…',
  '质检': 'Quality check',
  '编程题语言': 'Coding language',

  /* 深链：来自备考规划 */
  '来自备考规划': 'From Exam Plan AI',
  '请选择或新增一个练习科目开始出题': 'choose or create a subject to start generating questions',

  /* 提示与错误消息 */
  '已切换到「': 'Switched to "',
  '已导出数据文件（资料只含提取文字，不含原始文件）': 'Backup exported (materials include extracted text only, not the original files)',
  '已恢复初始状态': 'Back to a clean state',
  '练习科目已删除': 'Subject deleted',
  '练习科目已重命名': 'Subject renamed',
  '练习集已删除': 'Question set deleted',
  '资料已删除': 'Material deleted',
  '记录已清空': 'History cleared',
  '正在评分，请稍候完成': 'Grading is still running — finish it first',
  '这个练习集暂无错题，已切换为全部题目': 'No mistakes in this set yet — switched to all questions',
  '这个练习集还没有题目，先添加题目再考试': 'This set has no questions yet; add some before starting an exam',
  '练习集已被删除，无法继续学习': 'This question set was deleted, so the session cannot continue',
  '备份格式不正确': 'That backup format is not recognised',
  '备份里没有可导入的数据': 'The backup contains nothing to import',
  '不是有效的 JSON 备份文件': 'Not a valid JSON backup file',
  '备份文件超过 12 MB，请拆分后再导入': 'The backup is over 12 MB — split it before importing',
  '本地存储写入失败，可能是空间已满。请到「设置」导出备份后清理数据':
    'Local storage write failed — it may be full. Export a backup in Settings, then clear some data',
  '空间不足，练习集没有保存。请先导出备份并清理不用的练习集':
    'Not enough space — the set was not saved. Export a backup and remove sets you no longer need',
  '这次成绩未能写入本地存储，建议先导出备份': 'This result could not be saved locally — export a backup first',
  '进度自动保存失败，刷新页面可能丢失本次作答，建议先导出备份':
    'Auto-save failed; refreshing may lose this session. Export a backup first',
  '练习科目没有保存成功，请检查本地存储空间': 'The subject was not saved — check your local storage space',
  '重命名没有保存成功': 'The rename was not saved',
  '错题本清理未能写入，下次打开可能恢复': 'Mistake-book cleanup was not saved; it may come back on next load',
  '移动失败：本地存储写入出错': 'Move failed: local storage write error',
  '删除失败：本地存储写入出错，请稍后重试': 'Delete failed: local storage write error, try again shortly',
  '删除失败：本地存储写入出错，练习集仍然保留': 'Delete failed: local storage write error; the set is still there',
  '删除失败：资料库读取异常，请刷新后重试': 'Delete failed: the material store could not be read, reload and retry',
  '当前浏览器无法保存资料，请更换浏览器或关闭无痕模式':
    'This browser cannot store materials — switch browsers or leave private mode',
  '当前浏览器无法打开本地资料库，上传的资料这次不会保留':
    'This browser could not open the local material store, so uploads are not kept this time',
  '检测到本地数据损坏，已保留一份原始副本并重新初始化':
    'Corrupted local data detected; an original copy was kept and storage was reinitialised',
  '检测到本地数据损坏，但副本未能写入，请尽快导出检查':
    'Corrupted local data detected, but the copy could not be written — export and inspect it soon',
  '退出考试': 'Leave exam',
  '考试正在进行中，退出后本次作答将丢失，确定退出吗？':
    'The exam is still running. Leaving now discards this attempt — leave anyway?',
  '确定要删除这个练习集吗？': 'Delete this question set?',
  '资料超过单次上限，请拆成两轮上传': 'That is over the limit for one round — split it across two rounds',
  '在正式站点打开': 'Open it on the live site',
  '登录已失效，请刷新页面后重试': 'Your session expired — reload the page and retry',
  '网络连接中断，请检查网络后再试': 'Network interrupted — check your connection and retry',
  '解析组件加载失败，请检查网络后重试': 'The parser could not load — check your network and retry',
  'Word 解析组件加载失败': 'The Word parser could not load',
  '判题服务不可用': 'Judge service unavailable',
  'AI 服务暂时不可用，请稍后重试': 'The AI service is unavailable right now — try again shortly',
  '出题服务响应超时，请稍后重试或拆分资料': 'The question service timed out — retry later or split the material',
  'AI 调用太频繁了，等几秒再试': 'AI requests are being rate-limited — wait a few seconds',
  '站点刚更新完，服务还在重启，请等十几秒后刷新页面再试':
    'The site just updated and its services are restarting — wait about ten seconds, then reload',
}, {
  /* 解析相关提示 */
  '页无文字层已跳过': 'pages had no text layer and were skipped',
  '这份 PDF 没有可提取的文字层，可能是扫描件或图片版；请上传可复制文字的 PDF，或直接上传 Word/TXT':
    'This PDF has no extractable text layer — it is probably scanned. Upload a text PDF, a Word file, or paste the text',
  '旧版 Word · 已自动识别': 'Legacy Word · detected automatically',
  '旧版 Word 文档解析失败，请用 Word/WPS 另存为 .docx 后上传':
    'That legacy Word file could not be parsed. Save it as .docx in Word or WPS and upload again',
  '这份文档是更早的 Word 95 格式，请用 Word/WPS 另存为 .docx 后上传':
    'This is the older Word 95 format. Save it as .docx in Word or WPS and upload again',
  '这份 Word 文档设置了密码保护，暂时无法读取；请取消密码后另存为 .docx 再上传':
    'This Word file is password-protected and cannot be read. Remove the password, save as .docx and upload again',
  '这个文件不是标准的 .docx 格式（可能只是改了扩展名），请用 Word/WPS 另存为 .docx 后上传':
    'This is not a real .docx file (the extension may have been renamed). Save it as .docx in Word or WPS and upload again',
  '这份旧版 Word 文档里没有可提取的文字，可能是扫描件或纯图片；请上传可复制文字的文档，或直接粘贴文字':
    'That legacy Word document has no extractable text — it may be scanned or image-only. Upload a text document or paste the text',

  /* 向导 / 出题弹窗里的一次性文案 */
  '已建好': 'created',
  '开始 →': 'Start →',
  '打开 →': 'Open →',
  '稍后再说': 'Maybe later',
  '保存练习集': 'Save question set',
  '生成题目': 'Generate questions',
  '怎么处理这些资料': 'How should these materials be used?',
  '未留档': 'not kept',
  '已存入': 'saved',
  '原样保留': 'kept as is',
  '将生成': 'Will generate',
  '约': 'about',
  '道题': 'questions',
  '笔记生成新题': 'Notes become questions',
  '真题原样保留': 'Past papers stay as is',
  '点击切换：笔记生成新题 / 真题原样保留': 'Click to switch: notes become questions / past papers stay as is',

  /* 编程题运行态 */
  '正确答案': 'Correct answer',
  '运行中...': 'Running…',
  '运行中…': 'Running…',
  '正在运行测试用例...': 'Running the test cases…',
  '正在运行测试用例…': 'Running the test cases…',
  '输入你的答案...': 'Type your answer…',
  '输入你的答案…': 'Type your answer…',

  /* 出题进行中的状态文案 */
  '正在生成题目…': 'Writing questions…',
  '正在整理真题…': 'Cleaning the past paper…',
  '正在整理笔记和真题…': 'Cleaning notes and past papers…',
  'AI 正在出题…': 'AI is writing questions…',
  '正在出题…': 'Writing questions…',
  '正在整理…': 'Cleaning up…',
  '逐题保留，不改写不删减': 'Every question is kept verbatim, nothing rewritten or dropped',
  '约需 20–60 秒': 'about 20–60 seconds',
  '约需 1–2 分钟': 'about 1–2 minutes',
  '约需 2–4 分钟': 'about 2–4 minutes',

  /* 异常与兜底 */
  '可能是练习集被删除或数据异常，答题记录不受影响。':
    'The set may have been deleted, or the stored data is inconsistent. Your answer records are untouched.',
  '确认交卷': 'Submit the exam?',
  '所有题目已作答，确定交卷吗？': 'Every question is answered — submit now?',
  '清空记录': 'Clear history',
  '将清除所有练习历史和错题本，练习集不受影响。确定继续吗？':
    'This clears all practice history and the mistake book. Question sets are untouched — continue?',
  '将删除所有自建练习集、练习科目、上传的资料、练习记录、错题本、考点联动关系和本地设置。确定继续吗？':
    'This deletes every custom set, subject, uploaded material, record, mistake book, topic link and local setting. Continue?',
  '删除资料': 'Delete material',
  '重置全部': 'Reset everything',
  '判题服务返回了异常结果，请稍后重试': 'The judge returned an unexpected result — try again shortly',
  '判题超时（25 秒），请稍后重试': 'Judging timed out (25s) — try again shortly',
  '网络连接失败，判题服务暂不可用': 'Connection failed — the judge service is unavailable',
  '请检查网络或稍后重试': 'Check your network or try again shortly',
  '资料归档失败': 'The material could not be archived',
  '[StarQuiz] 资料归档失败': '[StarQuiz] material archiving failed',

  /* ---------- 备考化信息架构：今日状态卡 / 考试信息 / AI 三段弹窗 ---------- */
  '今日': 'Today',
  '累计正确率': 'Overall accuracy',
  '还没有练习成绩': 'No scores yet',
  '未开始': 'Not started',
  '还没有练习记录': 'No practice records yet',
  '还没有练习集': 'No question sets yet',
  '这个筛选下暂时没有题目': 'No questions in this filter',
  '练习记录': 'Practice history',
  '挑一个练习科目': 'Pick a subject',
  '全部练习科目': 'All practice subjects',
  '← 全部练习科目': '← All practice subjects',
  '按练习科目归档：上传的原始资料、提取的文字和生成的练习集都在同一个练习科目里。':
    'Filed by subject: original files, extracted text and generated sets all live in one place.',

  /* 首页调度台：主按钮状态 + 四种练法 */
  '开始练习': 'Start',
  '继续': 'Continue',
  '再过一遍': 'Run it again',
  '顺序练习': 'In order',
  '错题重练': 'Redo mistakes',
  '考点聚焦': 'Topic focus',
  '自检掌握度': 'Check your mastery',
  '还没有考过': 'No exam yet',
  '题待复习': 'to review',
  '分（上次）': 'pts (last)',
  '个考点待练': 'to practise',
  '查看练习记录': 'See practice history',

  /* 练习科目页的备考上下文 */
  '考试信息': 'Exam info',
  '编辑': 'Edit',
  '编辑练习科目': 'Edit practice subject',
  '编辑考试信息': 'Edit exam details',
  '练习科目名称与考试信息都能改': 'Rename the subject or change its exam details',
  '修改已保存': 'Changes saved',
  '修改没有保存成功': 'The changes could not be saved',
  '目标考试': 'Target exam',
  '备考目标': 'Goal',
  '考试日期': 'Exam date',
  '考试日期已过': 'Exam date passed',
  '开始练习日期': 'Start date',
  '每日目标': 'Daily goal',
  '高级设置': 'Advanced',
  '默认题量（道）': 'Default questions',
  '每日练习目标（道）': 'Daily goal',
  '请填写练习科目': 'Enter a subject name',
  '未设定': 'Not set',
  '距考试': 'Days left',

  /* 科目页头：Notion 式页图标与封面 */
  '页图标': 'Page icon',
  '封面': 'Cover',
  '无': 'None',
  '不用封面': 'No cover',
  '上传图片': 'Upload image',
  '上传的图片': 'Uploaded image',
  '纸纹': 'Paper',
  '雾青': 'Haze',
  '苔绿': 'Moss',
  '麦黄': 'Wheat',
  '陶土': 'Clay',
  '石墨': 'Slate',
  '封面已选好，保存后生效': 'Cover picked. Save to apply it.',
  '图片太大，本地存不下，换一张或选内置纹理。':
    'That image is too big to store locally. Try another one or a built-in texture.',
  '只能选图片文件。': 'Only image files work as a cover.',
  '这张图片读不出来，换一张或选内置纹理。':
    'That image could not be read. Try another file or a built-in texture.',
  '这个练习科目': 'this subject',
  '这个练习科目还没有内容。': 'This subject has nothing yet.',
  '已删除的练习集': 'a deleted set',
  '正在读取资料…': 'Loading materials…',
  '还没有练过': 'Nothing practised yet',
  '练习集中没有题目': 'This set has no questions',
  '练习集中没有可用的题目': 'No usable questions in this set',
  '份资料已存入': 'materials saved',
  '次练习': 'attempts',

  /* 新增练习科目向导 */
  '跳过资料': 'Skip materials',
  '新练习科目': 'new subject',

  /* AI 出题弹窗：资料来源 / 保存位置 / 处理方式 */
  '资料来源': 'Material',
  '保存位置': 'Destination',
  '已有练习科目': 'Existing practice subject',
  '保存到': 'Save to',
  '聚焦考点': 'Focus on one topic',
  '围绕一个考点出题': 'Questions around one topic',
  '出题方式': 'Question mode',
  '笔记出题 + 真题整理': 'Notes to questions + past papers tidied',
  '先填上练习科目名称': 'Type the new subject name first',
  '选一个要保存到的练习科目': 'Pick which subject to save to',
  '目标练习科目还没定，请选一个练习科目或填新练习科目名称': 'Pick a subject or name the new one first',

  /* 资料来源卡住的原因：只说差什么，怎么补救交给同一行的动作按钮 */
  '资料还在解析中…': 'Still parsing…',
  '这一轮的内容不足 50 字': 'This round has under 50 characters',
  '粘贴文字': 'Paste text',
  '清空粘贴文字': 'Clear the pasted text',
  '全部选上': 'Select all',
  '去练习科目页传': 'Upload on the subject page',

  /* 失败与兜底文案 */
  'AI 服务尚未启用，请在站点设置中配置 API Key。': 'Question generation is not enabled yet — add an API key in Site Settings.',
  'AI 没有返回题目': 'AI returned no questions',
  'AI 没有返回题目，请重试': 'AI returned no questions — try again',
  '整理超时了，请拆分资料后重试': 'Tidying timed out — split the material and retry',
  '生成超时了，请稍后重试，或减少题量': 'Generation timed out — retry shortly or ask for fewer questions',
  '生成超时了，请稍后重试，或减少题量、缩短资料':
    'Generation timed out — retry shortly, or use fewer questions and shorter material',
  '已放弃未完成的考试': 'Discarded the unfinished exam',
  '已放弃未完成的学习': 'Discarded the unfinished session',
  '未命名考试': 'Untitled exam',
  '已移除早期内置的演示练习集，题目现在只来自你上传的资料':
    'The built-in demo sets were removed; questions now come only from your materials',
  '练习科目数据损坏，已保留备份并重置为空列表':
    'Subject data was damaged — a backup was kept and the list was reset to empty',
  '练习科目导入失败：本地存储空间不足': 'Subjects could not be imported: local storage is full',
  '浏览器当前禁止了本地存储，本次的练习集和记录在刷新后可能丢失':
    'This browser blocks local storage — sets and records from this session may be lost on reload',
  '当前浏览器不支持本地资料库': 'This browser has no local material store',
  '当前浏览器无法保存资料，请改用支持的浏览器': 'This browser cannot store materials — switch to a supported one',
  '当前浏览器无法使用本地资料库，上传的资料不会保存。请更换浏览器或关闭无痕模式。':
    'This browser has no local material store, so uploads are not saved. Use another browser or leave incognito mode.',
  '资料没有写入成功': 'The material was not saved',
  '资料库打开失败': 'The material store failed to open',
  '资料库读写失败': 'The material store read/write failed',
  '资料库打开超时': 'The material store timed out',
  '资料换练习科目失败': 'The material could not be moved to another subject',
  '文件解析失败': 'File parsing failed',
  'PPT 解析组件加载失败': 'The PPT parser failed to load',
  '没有在 PPT 中找到幻灯片内容': 'No slides found in that PPT',
  '这个压缩包里读不到正文，可能是改了扩展名的其他文件':
    'No document text in that archive — the file extension may not match what it really is',
  '旧版 .ppt 暂不支持，请另存为 .pptx 后上传': 'Legacy .ppt is not supported — save it as .pptx first',
  '这是旧版 PowerPoint（.ppt）文件，请用 PowerPoint/WPS 另存为 .pptx 后上传':
    'This is a legacy PowerPoint (.ppt) file — save it as .pptx in PowerPoint or WPS first',
  '暂不支持该文件格式，请上传 PDF、Word（.docx/.doc）、PPT、TXT 或 Markdown':
    'That format is not supported yet — upload PDF, Word (.docx/.doc), PPT, TXT or Markdown',
  '几乎没有提取到文字，可能是扫描版文件，请先 OCR 或直接粘贴文字':
    'Almost no text extracted — it looks scanned. Run OCR first, or paste the text directly.',
  '数据格式异常': 'Unexpected data format',
  '练习集数据不是对象': 'The stored question set is not an object',
  '请检查网络后重试': 'Check your network and try again',
  '联动关系没有保存成功，请检查浏览器本地存储空间后重新进入':
    'The topic link was not saved — free up local storage and open it again',
  '这条联动关系的参数不完整，只按一次性跳转处理：回到备考规划再点一次即可':
    'This topic link is missing part of its context, so it only worked once — open it again from your study plan',
  '这一批没有生成成功': 'This batch was not generated',
  '没有新增资料': 'No new materials added',
  '没有可新增的数据，备份内容已全部存在': 'Nothing new to add — everything in the backup is already here',
  '未发现重复、答案缺失等问题': 'No duplicates or missing answers found',
  '疑似漏题': 'Possible missing questions',
  '关闭提示': 'Dismiss',
  '选填': 'Optional',
  '删除失败': 'Delete failed',
  '题目数据异常，已跳过': 'Some question data was invalid and got skipped',
  '内置示例': 'Sample set',
  '手动添加': 'Added by hand',
  'AI 根据资料出题': 'AI questions from material',
  '真题原样整理': 'Past papers kept as they are',
  '例如：导游业务、考研英语、高等数学': 'e.g. Guide Studies, GRE Math, Linear Algebra',
  '例如：导游业务、考研英语': 'e.g. Guide Studies, GRE Math',
  '例如：2026 年导游资格考试': 'e.g. 2026 National Tour Guide Exam',
  '例如：一次通过 / 90 分以上': 'e.g. pass in one try / above 90',
  '例如：导游语言技巧、定语从句': 'e.g. guiding scripts, relative clauses',
  '杂': 'Mixed',
  '简体中文': 'Simplified Chinese',
  '✓ 通过': '✓ Passed',
  '✗ 未通过': '✗ Failed',
  '（代码见作答）': '(code shown in the answer)',
  '（全部来自原文）': '(all taken from the source)',
  '知识点：': 'Key point:',
  '题型：': 'Type:',
  '题目数：': 'Questions:',
  '移除': 'remove',
  '文件': 'File',

  /* 练习科目总览：练习科目收纳卡组 + 练习记录（对齐 Exam Plan 的 MasterDashboard / CourseAccordionGallery） */
  '练习科目收纳': 'Practice subjects',
  '最近考试': 'Nearest exam',
  '还没设考试日期': 'No exam date set yet',
  '今日进度': 'Today',
  '练习进度': 'Practice progress',
  '今天考试': 'Exam today',
  '今天': 'Today',
  '进入': 'Open',
  '立即创建': 'Create now',
  '创建新的练习科目': 'Create a new subject',
  '还没有资料': 'No materials',
  '回到练习科目': 'Back to subjects',
  '暂无练习科目': 'No practice subjects yet',
  '删除此练习科目': 'Delete this subject',
  '目标：': 'Goal: ',
});

/* 含数字、名称或语序变化的句子：正则 + 替换（替换里可以继续调用 t）。 */
// 英文的「1 questions」是硬伤：所有带计数的短语统一走 pl()
const pl = (n, one, many) => `${n} ${n === '1' ? one : many}`;
// 「这 N 份」单数要说 this material：pl() 只管词尾，指示词得单独管
const plThis = (n, one, many) => (n === '1' ? `this ${one}` : `these ${n} ${many}`);
// 超长提示的主语：浏览器和函数共用同一批标签词
const LIMIT_LABEL = {
  '笔记资料': 'Your notes',
  '真题资料': 'The past papers',
  '资料': 'The material',
  '笔记和真题合计': 'Notes and past papers together'
};

const EN_PATTERNS = [
  /* 科目页头的「每日目标 20 题」：标签与取值是两个节点，这里只翻取值 */
  [/^(\d+) 题$/, (m) => pl(m[1], 'question', 'questions')],
  /* 错题本 v2：复习节奏、组卷预览、收纳计数（带数字，放在短模式之前） */
  [/^(\d+) 题 · 错 (\d+) 次$/, (m) => `${pl(m[1], 'question', 'questions')} · ${pl(m[2], 'miss', 'misses')}`],
  [/^今日到期 (\d+) [题道]$/, (m) => `${pl(m[1], 'question', 'questions')} due today`],
  [/^共 (\d+) 题待复习$/, (m) => `${pl(m[1], 'question', 'questions')} to review`],
  [/^题今天到期$/, 'due today'],
  [/^(\d+) 题错题待复习$/, (m) => `${pl(m[1], 'mistake', 'mistakes')} to review`],
  [/^错题本还有 (\d+) 道待复习$/, (m) => `${pl(m[1], 'mistake', 'mistakes')} still to review`],
  [/^顽固 (\d+) 道$/, (m) => `${m[1]} stubborn`],
  [/^(\d+) 天后可复习$/, (m) => `Due in ${pl(m[1], 'day', 'days')}`],
  [/^已于 (.+) 掌握$/, (m) => `Mastered on ${m[1]}`],
  [/^展开其余 (\d+) 个考点$/, (m) => `Show ${pl(m[1], 'more key point', 'more key points')}`],
  [/^本次 (\d+) 题：错题 (\d+) 道 · 新题 (\d+) 道 · 跨 (\d+) 个练习集，交卷后统一评分。$/,
    (m) => `${pl(m[1], 'question', 'questions')} this time: ${m[2]} from your mistakes · ${m[3]} new · across ${pl(m[4], 'set', 'sets')} — graded when you submit.`],
  // 弹窗选项「今日到期（3 题）」：前段是固定 UI 词（不含数字），括号里补英文单复数
  [/^([^\d（）]{2,12})（(\d+) 题）$/, (m) => `${t(m[1]) || m[1]} (${pl(m[2], 'question', 'questions')})`],

  /* 练习科目总览：卡组事实行、进度注记、记录摘要与折叠段计数（放在最前，避免被后面的短模式抢走） */
  [/^共 (\d+) 道题$/, (m) => `${pl(m[1], 'question', 'questions')} in total`],
  [/^共 (\d+) 道题待练$/, (m) => (m[1] === '0' ? 'Nothing to practise yet' : `${pl(m[1], 'question', 'questions')} to practise`)],
  [/^已做 (\d+)\/(\d+) 题 · 正确率 (\d+)%$/, (m) => `Done ${m[1]} of ${m[2]} · ${m[3]}% accuracy`],
  [/^共 (\d+) 次练习 · 平均 (\d+) 分 · 已批改 (\d+) 题$/,
    (m) => `${pl(m[1], 'attempt', 'attempts')} · avg ${m[2]}% · ${pl(m[3], 'question', 'questions')} graded`],
  [/^展开全部 (\d+) 条$/, (m) => `Show all ${pl(m[1], 'entry', 'entries')}`],
  [/^展开其余 (\d+) 套$/, (m) => `Show ${pl(m[1], 'more set', 'more sets')}`],
  [/^(\d+) 个练习集 · (\d+) 道题 · (\d+) 份资料$/,
    (m) => `${pl(m[1], 'set', 'sets')} · ${pl(m[2], 'question', 'questions')} · ${pl(m[3], 'material', 'materials')}`],
  [/^(\d+) 份 · ([\d,.]+) 字$/, (m) => `${pl(m[1], 'file', 'files')} · ${m[2]} characters`],
  [/^(\d+) 个 · (\d+) 题 · (\d+) 个知识点$/,
    (m) => `${pl(m[1], 'set', 'sets')} · ${pl(m[2], 'question', 'questions')} · ${pl(m[3], 'key point', 'key points')}`],
  [/^删除练习科目 (.+)$/, (m) => `Delete subject ${m[1]}`],
  [/^打开练习科目 (.+)$/, (m) => `Open subject ${m[1]}`],
  [/^今日目标已达成$/, 'Daily goal met'],

  /* 首页调度台与进度口径 */
  [/^连续 (\d+) 天$/, (m) => `${m[1]}-day streak`],
  [/^待练 (\d+) 套$/, (m) => `${pl(m[1], 'set', 'sets')} to practise`],
  [/^距考试 (\d+) 天$/, (m) => `${m[1]} day${m[1] === '1' ? '' : 's'} to the exam`],
  [/^距考试 (\d+) 天 · (.+)$/, (m) => `${m[1]} day${m[1] === '1' ? '' : 's'} to the exam · ${m[2]}`],
  [/^累计正确率 (\d+)%$/, 'Overall accuracy $1%'],
  [/^已做 (\d+)\/(\d+) 题$/, (m) => `Done ${m[1]} of ${m[2]}`],
  [/^最佳 (\d+)%$/, 'Best $1%'],
  [/^共 (\d+) 题$/, (m) => `${pl(m[1], 'question', 'questions')} in total`],
  [/^重做错题 (\d+) 题$/, (m) => `Redo ${pl(m[1], 'mistake', 'mistakes')}`],
  [/^错 (\d+) 次$/, (m) => `${pl(m[1], 'miss', 'misses')}`],
  [/^\/ (\d+) 题$/, (m) => `/ ${pl(m[1], 'question', 'questions')}`],
  [/^难度 ([123])$/, 'Difficulty $1'],
  [/^第 (\d+) 题 · 共 (\d+) 题$/, 'Question $1 of $2'],
  [/^第 (\d+) 步 \/ 共 (\d+) 步$/, 'Step $1 of $2'],
  [/^第 (\d+) 题，(当前|未作答|已答|答对|答错|待提交)$/, (m) => `Question ${m[1]}, ${t(m[2])}`],
  [/^第 (\d+) 题 · (单选|多选|判断|填空|编程) · (当前|未作答|已答|答对|答错)$/, (m) => `Question ${m[1]} · ${t(m[2])} · ${t(m[3])}`],
  [/^第 (\d+) 题（(单选|多选|判断|填空|编程)）$/, (m) => `Question ${m[1]} (${t(m[2])})`],
  [/^第 (\d+) 题：(.+)$/, (m) => `Question ${m[1]}: ${m[2]}`],
  [/^第 (\d+)\/(\d+) 题 · 已答 (\d+)$/, (m) => `Question ${m[1]}/${m[2]} · ${m[3]} answered`],
  [/^已答 (\d+)\/(\d+) · 剩余 (.+)$/, (m) => `Answered ${m[1]}/${m[2]} · ${m[3]} left`],
  [/^· 已答 (\d+)\/(\d+) · 剩余 (.+)$/, (m) => `· ${m[1]}/${m[2]} answered · ${m[3]} left`],
  [/^· 第 (\d+)\/(\d+) 题 · 已答 (\d+)$/, (m) => `· Question ${m[1]}/${m[2]} · ${m[3]} answered`],
  [/^· (考试模式|学习模式)$/, (m) => `· ${t(m[1])}`],
  [/^(\d+) 个练习集 · (\d+) 份资料$/, (m) => `${pl(m[1], 'question set', 'question sets')} · ${pl(m[2], 'material', 'materials')}`],
  [/^(\d+) 个练习集 · (\d+) 道题$/, (m) => `${pl(m[1], 'set', 'sets')} · ${pl(m[2], 'question', 'questions')}`],
  [/^(\d+) 份资料 · (\d+) 个练习集$/, (m) => `${pl(m[1], 'material', 'materials')} · ${pl(m[2], 'question set', 'question sets')}`],
  [/^(\d+) 份资料 · (\d+) 道题目$/, (m) => `${pl(m[1], 'material', 'materials')} · ${pl(m[2], 'question', 'questions')}`],
  [/^练习集与记录已用 (.+)（上限约 5 MB）(?: · 资料库 (\d+) 份)?$/,
    (m) => `Sets and records use ${m[1]} (about 5 MB available)${m[2] ? ` · ${pl(m[2], 'material file', 'material files')}` : ''}`],
  [/^已答 (\d+) \/ (\d+) 题$/, (m) => `Answered ${m[1]} / ${m[2]}`],
  [/^(学习模式|考试模式) · 已答 (\d+) \/ (\d+)$/, (m) => `${t(m[1])} · ${m[2]} / ${m[3]} answered`],
  [/^(\d+)\s*\/\s*(\d+) 题$/, (m) => `${m[1]} / ${pl(m[2], 'question', 'questions')}`],
  [/^\/ (\d+) 今日目标$/, 'of $1 daily goal'],
  [/^今日 (\d+) 题$/, 'Today $1'],
  [/^(\d+) 道题目?$/, (m) => pl(m[1], 'question', 'questions')],
  [/^(\d+) 个练习集$/, (m) => pl(m[1], 'question set', 'question sets')],
  [/^(\d+) 份资料已存入$/, (m) => `${pl(m[1], 'material', 'materials')} saved`],
  [/^(\d+) 份未成功$/, '$1 failed'],
  [/^另有 (\d+) 份失败$/, '$1 more failed'],
  [/^(\d+) 个文件解析失败$/, (m) => `${pl(m[1], 'file', 'files')} failed to parse`],
  [/^(\d+) 个知识点$/, (m) => pl(m[1], 'key point', 'key points')],
  [/^(\d+) 知识点 · 已练 (\d+) 次$/, (m) => `${pl(m[1], 'key point', 'key points')} · ${pl(m[2], 'attempt', 'attempts')}`],
  [/^(\d+) 次练习 · 已做 (\d+)\/(\d+) 题 · 最佳 (\d+)%$/,
    (m) => `${m[1]} attempt${m[1] === '1' ? '' : 's'} · done ${m[2]} of ${m[3]} · best ${m[4]}%`],
  [/^(\d+) 次练习 · 最佳 (\d+)%$/, (m) => `${m[1]} attempt${m[1] === '1' ? '' : 's'} · best ${m[2]}%`],
  [/^正确率 · (\d+) 次练习$/, (m) => `Accuracy · ${m[1]} attempt${m[1] === '1' ? '' : 's'}`],
  // 悬空的「· 」会先被 lookup 摘掉，所以这里不能把 · 写进正则开头
  [/^(\d+) 次练习$/, (m) => `${m[1]} attempt${m[1] === '1' ? '' : 's'}`],
  [/^(\d+) 天 · (.+)$/, (m) => `${m[1]} day${m[1] === '1' ? '' : 's'} · ${t(m[2])}`],
  [/^共批改 (\d+) 题$/, (m) => `${pl(m[1], 'answer', 'answers')} graded`],
  [/^(\d+) 套 · (\d+) 题$/, (m) => `${pl(m[1], 'set', 'sets')} · ${pl(m[2], 'question', 'questions')}`],
  [/^(\d+) 份资料 · (\d+) 个练习集 · (\d+) 道题目 · (\d+) 字提取文字$/,
    (m) => `${pl(m[1], 'material', 'materials')} · ${pl(m[2], 'set', 'sets')} · ${pl(m[3], 'question', 'questions')} · ${Number(m[4]).toLocaleString('en-US')} chars`],
  [/^(单选|多选|判断|填空|编程) × (\d+)$/, (m) => `${t(m[1])} × ${m[2]}`],
  [/^(\d+) 字$/, (m) => `${Number(m[1]).toLocaleString('en-US')} chars`],
  [/^约 (\d+) 题$/, (m) => `about ${pl(m[1], 'question', 'questions')}`],
  [/^识别到约 (\d+) 道题，$/, (m) => `About ${pl(m[1], 'question', 'questions')} detected, `],
  [/^将生成 (\d+) 题$/, (m) => `Will generate ${pl(m[1], 'question', 'questions')}`],
  [/^随机 (\d+) 题$/, 'Random $1'],
  [/^(\d+) 分钟$/, '$1 min'],
  [/^（错 (\d+) 次）$/, (m) => `(${pl(m[1], 'miss', 'misses')})`],
  [/^另有 (\d+) 题未作答或未评分，不计入得分$/, (m) => `${pl(m[1], 'question', 'questions')} left blank or ungraded are not scored`],
  [/^(\d+) 分$/, '$1 pts'],
  [/^(\d+)分(?:(\d+)秒)?$/, (m) => `${m[1]}m${m[2] ? ` ${m[2]}s` : ''}`],
  [/^(.+) · (\d+)分(?:(\d+)秒)?$/, (m) => `${m[1]} · ${m[2]}m${m[3] ? ` ${m[3]}s` : ''}`],
  [/^(\d+) 天$/, (m) => `${m[1]} day${m[1] === '1' ? '' : 's'}`],
  [/^(\d+) 页$/, (m) => pl(m[1], 'page', 'pages')],
  /* 资料行那串「笔记 · 891 KB · 31,210 字 · 11-04 · 仅文字」：整句命中后剩下的两段仍要各自过一遍词典，
     否则尾巴上的「仅文字」「原始文件未保存」会跟着原样留在英文里；数字也按英文习惯补回千分位。 */
  [/^(笔记|真题|其他) · (.+) · ([\d,]+) 字 · (.+)$/, (m) => `${t(m[1])} · ${t(m[2])} · ${Number(m[3].replace(/,/g, '')).toLocaleString('en-US')} chars · ${t(m[4])}`],
  [/^知识点 · (.+)$/, 'Key point · $1'],
  [/^模拟考试 · (.+)$/, 'Mock exam · $1'],
  [/^← 返回(.+)$/, '← Back to $1'],
  // 返回按钮后面跟的是考点名/练习集名（用户数据）或固定 UI 词：翻得动就翻，翻不动原样留着
  [/^← (.+)$/, (m) => `← ${t(m[1]) || m[1]}`],
  [/^(.+) · 练习集$/, '$1 · Question sets'],
  [/^练习集已保存到「(.+)」$/, 'Question set saved to "$1"'],
  [/^已切换到「(.+)」$/, 'Switched to "$1"'],
  [/^已移动到「(.+)」$/, 'Moved to "$1"'],
  [/^「(.+)」已在列表中$/, '"$1" is already in the list'],
  [/^「(.+)」超过 30MB，请拆分后再上传$/, '"$1" is over 30 MB — split it before uploading'],
  [/^「(.+)」当前在「(.+)」。$/, (m) => `"${m[1]}" is currently in "${m[2]}".`],
  [/^(.+)：超过 30MB$/, '$1: over 30 MB'],
  [/^一次最多 (\d+) 份资料，剩下的拆成下一轮$/, (m) => `Up to ${pl(m[1], 'file', 'files')} per round — save the rest for the next one`],
  [/^(\d+) 份资料未能从资料库删除，刷新后可能仍会显示$/, (m) => `${pl(m[1], 'file', 'files')} could not be removed from the store and may reappear after a reload`],
  [/^围绕(.+)出题练习：上传对应资料，AI 会生成题目并归入本练习科目。$/, (m) => `Practise ${m[1]}: upload its material and AI will generate questions for this subject.`],
  /* 考试级快照：随跳转一起带过来的资料与真题 */
  [/^围绕(.+)出题练习：这场考试的资料已在这个练习科目里（(.+)），可直接出题。$/, (m) => `Practise ${m[1]}: this exam's material is already in this subject (${m[2]}) — generate right away.`],
  [/^备考规划聚焦考点「(.+?)」(?:（(.+?)）)?：这场考试的资料已在这里（(.+)），可直接出题。$/, (m) => `Exam Plan topic "${m[1]}"${m[2] ? ` (${m[2]})` : ''}: this exam's material is already here (${m[3]}) — generate right away.`],
  [/^来自备考规划(?:（(.+?)）)?：这场考试的资料已在这里（(.+)），可直接出题。$/, (m) => `From Exam Plan AI${m[1] ? ` (${m[1]})` : ''}: this exam's material is already here (${m[2]}) — generate right away.`],
  [/^已同步考试「?(.+?)」?的资料与真题：新增 (\d+) 份，可以直接出题$/, (m) => `Synced materials and past papers for "${m[1]}": ${m[2]} added, ready to generate.`],
  [/^考试「?(.+?)」?的资料与真题都已在这里，可以直接出题$/, (m) => `All materials and past papers for "${m[1]}" are already here, ready to generate.`],
  [/^这次跳转没有带来新资料：已选入「?(.+?)」?的 (\d+) 份资料，可以直接出题$/, (m) => `This jump brought no new material: ${pl(m[2], 'file', 'files')} from "${m[1]}" ${Number(m[2]) === 1 ? 'is' : 'are'} selected, ready to generate.`],
  [/^考试「?(.+?)」?里还没有资料：上传资料即可出题$/, (m) => `The subject for "${m[1]}" has no material yet: upload one to generate questions.`],
  [/^「(.+?)」的资料还没勾上（(\d+) 份）$/, (m) => `None of "${m[1]}"'s ${pl(m[2], 'material', 'materials')} are ticked.`],
  [/^「(.+?)」还没有资料$/, (m) => `"${m[1]}" has no materials yet.`],
  [/^(\d+) 份资料没能写入本地资料库，请手动重新上传$/, (m) => `${pl(m[1], 'file', 'files')} could not be saved to the local store — upload again manually`],
  [/^另有 (\d+) 份资料超过单次携带上限，需要手动上传$/, (m) => `${pl(m[1], 'more file', 'more files')} exceeded the per-jump limit — upload manually`],
  [/^继续「(.+?)」的考点「(.+?)」练习$/, (m) => `Back to "${m[2]}" in "${m[1]}"`],
  [/^继续「(.+?)」的考点「(.+?)」练习，这次补入 (\d+) 份资料和真题$/, (m) => `Back to "${m[2]}" in "${m[1]}" — ${pl(m[3], 'material/paper file', 'material/paper files')} added this time`],
  [/^(\d+) 份资料$/, (m) => pl(m[1], 'material', 'materials')],
  [/^把资料放进「(.+)」$/, 'Put materials into "$1"'],
  [/^直接 AI 出题（用这 (\d+) 份资料）$/, (m) => `Generate with AI from ${plThis(m[1], 'material', 'materials')}`],
  [/^学习完成：答对 (\d+)\/(\d+)，正确率 (\d+)%$/, (m) => `Session done: ${m[1]}/${m[2]} correct, ${m[3]}% accuracy`],
  [/^导入完成：(.+)$/, 'Import complete: $1'],
  [/^导入失败：(.+)$/, 'Import failed: $1'],
  [/^删除练习集「(.+)」$/, 'Delete question set "$1"'],
  [/^来自备考规划：练「(.+)」。$/, (m) => `From Exam Plan AI: practise "${m[1]}".`],
  [/^来自备考规划(.+)$/, 'From Exam Plan AI$1'],
  [/^去重 (\d+) 题$/, (m) => `${pl(m[1], 'duplicate', 'duplicates')} removed`],
  [/^剔除 (\d+) 题$/, (m) => `${pl(m[1], 'question', 'questions')} dropped`],
  [/^修复 (\d+) 题$/, (m) => `${pl(m[1], 'question', 'questions')} repaired`],
  [/^(\d+) 条$/, (m) => pl(m[1], 'note', 'notes')],
  [/^前 (\d+) 条（共 (\d+) 条）$/, 'first $1 of $2'],
  [/^题目数：(\d+)$/, 'Questions: $1'],
  [/^知识点：(\d+)$/, 'Key points: $1'],
  [/^联动考点：(.+?) 已归入 (\d+) 题，练习结果可回流$/, (m) => `Linked topic "${m[1]}" · ${pl(m[2], 'question', 'questions')} attributed — results can flow back`],
  [/^联动考点：(.+?) 没有可靠归属，本练习集只记录来源$/, (m) => `Linked topic "${m[1]}" has no reliable attribution — this set only records its source`],
  [/^备考规划练习回执(.*)$/, 'Exam Plan practice receipt$1'],
  [/^目标考点「(.+?)」本次计分 (\d+) 题，答对 (\d+) 题，正确率 (\d+)%。$/, (m) => `Target topic "${m[1]}": ${m[2]} graded, ${m[3]} correct, ${m[4]}% accuracy.`],
  /* 练习回执那行只剩「模式 · 时间」：模式词翻完就停，时间戳是数据，原样保留 */
  [/^(考试模式|学习模式) · (.+)$/, (m) => `${t(m[1])} · ${m[2]}`],
  /* 计数短语一律走 pl()：「1 notes」这种英文硬伤不能留在界面上 */
  [/^笔记 (\d+) 份$/, (m) => pl(m[1], 'note', 'notes')],
  [/^笔记 (\d+) 份、真题 (\d+) 份$/, (m) => `${pl(m[1], 'note', 'notes')} · ${pl(m[2], 'past paper', 'past papers')}`],
  [/^真题 (\d+) 份$/, (m) => pl(m[1], 'past paper', 'past papers')],
  [/^(\d+) 份 · 生成新题$/, '$1 · generate questions'],
  [/^(\d+) 份 · 原样保留$/, '$1 · keep as is'],
  /* 弹窗里的分组小药丸：整句一条正则，不靠「·」逐段兜底（漏一段就是半个中文） */
  [/^笔记 (\d+) 份 · 生成新题$/, (m) => `${pl(m[1], 'note', 'notes')} · generate questions`],
  [/^真题 (\d+) 份 · 原样保留$/, (m) => `${pl(m[1], 'past paper', 'past papers')} · keep as is`],
  [/^段并行整理 · 已完成/, 'segments cleaned · done'],
  [/^整理全部真题 · 已用时/, 'Cleaning the whole paper · elapsed'],
  [/^(笔记|真题) · 已用时(.+)$/, (m) => `${t(m[1])} · elapsed ${m[2]}`],
  [/^(\d+) 段 · 已用时(.+)$/, (m) => `${pl(m[1], 'segment', 'segments')} · elapsed ${m[2]}`],
  [/^共 (\d+) 题 · 已用时 (\d+) 秒$/, (m) => `${pl(m[1], 'question', 'questions')} · ${m[2]}s elapsed`],
  [/^· 已用时 (\d+) 秒$/, '· elapsed $1s'],
  [/^已用时 (\d+) 秒$/, 'elapsed $1s'],
  [/^分 (\d+) 段并行整理 · 已完成 (\d+)\/(\d+) 段 · 已用时 (\d+) 秒$/,
    (m) => `Cleaning in ${m[1]} parallel segments · ${m[2]}/${m[3]} done · ${m[4]}s elapsed`],
  [/^笔记出题 (\d+)\/(\d+)$/, 'Notes to questions $1/$2'],
  [/^真题整理 (\d+)\/(\d+) 段$/, 'Past papers cleaned $1/$2 segments'],
  [/^分 (\d+) 批并行生成 · 已完成 (\d+)\/(\d+) 批 · 已用时 (\d+) 秒$/,
    (m) => `Generating in ${m[1]} parallel batches · ${m[2]}/${m[3]} done · ${m[4]}s elapsed`],
  /* 一轮装不下：浏览器和函数说同一句话，英文也只有一种说法 */
  // 中文用「字符」：这里比的是含空白的原始长度，和上限同一个数；别处的「字」都不数空白
  [/^(笔记资料|真题资料|资料|笔记和真题合计) ([\d,]+) 字符，超过单次上限 ([\d,]+) 字符，请拆成两轮上传(，避免漏题)?$/,
    (m) => `${LIMIT_LABEL[m[1]]}: ${m[2]} characters — over the ${m[3]}-character limit for one round. ${m[4] ? 'Split it so no question is missed.' : 'Split it across two rounds.'}`],
  [/^这一轮需要分成 (\d+) 批，超过单轮 (\d+) 批，请拆成两轮上传$/,
    (m) => `This round needs ${m[1]} batches — over the ${m[2]}-batch limit for one round. Split it across two rounds.`],
  [/^只保留 (\d+) 份$/, (m) => `Keep only ${pl(m[1], 'file', 'files')}`],
  [/^跳过最后一份（留 (\d+) 份）$/, (m) => `Drop the last file (keep ${m[1]})`],
  [/^已保留 (\d+) 份，跳过 (\d+) 份$/, (m) => `Kept ${m[1]}, skipped ${m[2]}`],
  [/^已跳过「(.+?)」，可以再点一次生成$/, (m) => `Skipped "${m[1]}" — generate again`],

  /* 资料解析进度与文件条目 */
  [/^正在解析 (\d+) 个文件…$/, (m) => `Parsing ${pl(m[1], 'file', 'files')}…`],
  [/^正在解析 (\d+) 个文件\.\.\.$/, (m) => `Parsing ${pl(m[1], 'file', 'files')}…`],
  [/^([\d,]+) 字$/, (m) => `${m[1]} chars`],
  [/^（([\d,]+) 字）$/, '($1 chars)'],
  [/^已存入([^·]+)$/, 'saved to "$1"'],
  [/^✓ 已提取 (.+) 个文件$/, (m) => `Extracted ${pl(m[1], 'file', 'files')}`],
  [/^✓ 已提取$/, 'Extracted'],

  /* 一批资料的读取进度：新建向导 / 科目页 / AI 弹窗共用同一块面板，句子也只有一套 */
  [/^读取资料 (\d+)\/(\d+)$/, 'Reading $1/$2'],
  [/^这一批读了 (\d+) 份$/, (m) => `Read ${pl(m[1], 'file', 'files')}`],
  [/^取消（还剩 (\d+) 份）$/, (m) => `Cancel (${m[1]} left)`],
  [/^重试失败的 (\d+) 份$/, (m) => `Retry ${pl(m[1], 'failed file', 'failed files')}`],
  [/^继续读取 (\d+) 份$/, (m) => `Read ${m[1]} more`],
  [/^还有 (\d+) 份没读$/, (m) => `${pl(m[1], 'file', 'files')} not read`],
  [/^(\d+) 份读不出$/, (m) => `${pl(m[1], 'file', 'files')} could not be read`],
  /* 面板那两句长话由 upload-queue.js 拼中文，英文只在这一处有说法：
     「读到几份 · 多少字 · 预算用满 · 剩下几份没读 · 该怎么办」一句说完。 */
  [/^这一批读到 (\d+) 份、共 ([\d,]+) 字，单批预算已用满，剩下 (\d+) 份没有读，请分两批再传$/,
    (m) => `Read ${pl(m[1], 'file', 'files')} · ${m[2]} characters — one batch is full, `
      + `${pl(m[3], 'file', 'files')} not read. Split them into a second batch.`],
  [/^已取消，剩下 (\d+) 份没有读$/, (m) => `Cancelled — ${pl(m[1], 'file', 'files')} not read.`],
  [/^约 ([\d,]+) 题$/, (m) => `about ${pl(m[1], 'question', 'questions')}`],
  [/^真题原样保留 约 (\d+) 题$/, (m) => `Past papers kept as is · about ${pl(m[1], 'question', 'questions')}`],

  /* 出题弹窗：题量推荐与容量提示 */
  [/^识别到约 (\d+) 道题$/, (m) => `Found about ${pl(m[1], 'question', 'questions')}`],
  [/^([\d,]+) 字资料 · 按篇幅建议 (\d+) 题，可调 (\d+)–(\d+)(；真题部分全部保留，不计入此数量)?$/,
    (m) => `${m[1]} characters · about ${pl(m[2], 'question', 'questions')} for that length, adjustable ${m[3]}–${m[4]}${m[5] ? ' (past papers are all kept and not counted here)' : ''}`],
  [/^([\d,]+) 字资料 · 用练习科目默认 (\d+) 题（按篇幅建议 (\d+)），可调 (\d+)–(\d+)(；真题部分全部保留，不计入此数量)?$/,
    (m) => `${m[1]} characters · this subject defaults to ${m[2]} (length suggests ${m[3]}), adjustable ${m[4]}–${m[5]}${m[6] ? ' (past papers are all kept and not counted here)' : ''}`],
  [/^；真题部分全部保留，不计入此数量$/, '(past papers are all kept and not counted here)'],

  /* 服务异常：带 HTTP 状态码 */
  [/^当前页面不支持后端服务（HTTP 405），AI 出题和判题需要在正式站点使用：(.+)$/,
    'This page has no backend (HTTP 405); AI questions and grading need the live site: $1'],
  [/^出题服务暂时没有响应（HTTP (\d+)），可能刚更新完或网络不稳定，请再点一次生成$/,
    'The question service is not responding (HTTP $1), maybe it just restarted — generate again'],
  [/^出题服务出错了（HTTP (\d+)），请稍后重试$/, 'The question service failed (HTTP $1) — try again shortly'],
  [/^网络或服务异常（HTTP (\S+)），没拿到出题结果，请重试$/, 'Network or service error (HTTP $1), no questions returned — retry'],
  [/^判题服务暂不可用（HTTP ([^）]+)）$/, 'Judge service unavailable (HTTP $1)'],

  /* 资料库与解析元信息 */
  [/^「(.+)」已有资料$/, 'Materials already in "$1"'],
  // AI 出题弹窗第二步的归属提示：练习科目名是用户数据，原样留在引号里
  [/^「(.+?)」已有 (\d+) 个练习集 · (\d+) 份资料$/,
    (m) => `"${m[1]}" has ${pl(m[2], 'question set', 'question sets')} · ${pl(m[3], 'material', 'materials')}`],
  [/^过滤 (\d+) 行页眉页脚$/, (m) => `filtered ${pl(m[1], 'header/footer line', 'header/footer lines')}`],
  [/^· 过滤 (\d+) 行页眉页脚$/, (m) => `· filtered ${pl(m[1], 'header/footer line', 'header/footer lines')}`],
  [/^(\d+) 页(?: · 过滤 (\d+) 行页眉页脚)?(?:，(\d+) 页无文字层已跳过)?$/,
    (m) => `${pl(m[1], 'page', 'pages')}${m[2] ? ` · ${pl(m[2], 'header/footer line', 'header/footer lines')} filtered` : ''}${m[3] ? ` · ${pl(m[3], 'blank page', 'blank pages')} skipped` : ''}`],
  [/^(\d+) 页无文字层已跳过$/, (m) => `${pl(m[1], 'page', 'pages')} without a text layer skipped`],

  /* 时长与出题进度副标题 */
  [/^(\d+)秒$/, '$1s'],
  [/^共 (\d+) 题，(.+)$/, (m) => `${pl(m[1], 'question', 'questions')}, ${t(m[2])}`],
  [/^识别到约 (\d+) 道题，逐题保留，不改写不删减$/, (m) => `Found about ${pl(m[1], 'question', 'questions')}; each is kept verbatim`],
  [/^逐题保留，不改写不删减$/, 'Every question kept verbatim, nothing rewritten or dropped'],
  [/^笔记生成 (\d+) 题 · 真题(?:约 ([\d,]+) 题)?全部原样保留$/,
    (m) => `Notes become ${pl(m[1], 'question', 'questions')} · past papers${m[2] ? ` (about ${m[2]})` : ''} kept as is`],

  /* 二次确认：带名称与数量的删除 / 交卷提示 */
  [/^确定删除「(.+?)」吗？$/, 'Delete "$1"?'],
  [/^确定删除「(.+?)」吗？(.+)$/, (m) => `Delete "${m[1]}"? ${t(m[2])}`],
  [/^还有 (\d+) 题未作答，交卷后将无法修改，确定交卷吗？$/,
    'There are still $1 unanswered questions. Answers cannot be changed after submitting — submit now?'],
  // 数量跟着变单复数：「2 question set(s)」这种括号复数在确认弹窗里很刺眼
  [/^会删除 (\d+) 份资料(?:，(\d+) 个练习集移到「未分类」)?。$/,
    (m) => `${pl(m[1], 'material', 'materials')} will be deleted${m[2] ? ` and ${pl(m[2], 'question set', 'question sets')} will move to Unfiled` : ''}.`],
  [/^(\d+) 个练习集会移到「未分类」。$/, (m) => `${pl(m[1], 'question set', 'question sets')} will move to Unfiled.`],
  [/^提取的文字和原始文件都会删除。$/, 'Both the extracted text and the original file will be deleted.'],
  [/^该操作不可恢复，历史练习记录会保留。$/, 'This cannot be undone; your practice history is kept.'],

  /* ---------- 备考化信息架构（本轮）：状态行 / 考试上下文 / 向导与 AI 三段 ---------- */
  // 「距考试 N 天」由上面首页调度台那段负责，这里不再重复一条永远走不到的正则
  [/^每日目标 (\d+) 题$/, (m) => `Daily goal: ${pl(m[1], 'question', 'questions')}`],
  [/^每日目标 (\d+)$/, 'Daily goal: $1'],
  [/^目标：(.+)$/, 'Goal: $1'],
  [/^知识点：(.+)$/, 'Key point: $1'],
  [/^题型：(.+)$/, 'Type: $1'],
  [/^备注：(.+)$/, 'Note: $1'],
  [/^题目数：(.+)$/, 'Questions: $1'],
  [/^(\d+) 个练习科目$/, (m) => pl(m[1], 'subject', 'subjects')],
  [/^(\d+) 个练习集（(\d+) 题）$/, (m) => `${pl(m[1], 'set', 'sets')} (${pl(m[2], 'question', 'questions')})`],
  [/^(\d+) 条记录$/, (m) => pl(m[1], 'record', 'records')],
  [/^(\d+) 道错题$/, (m) => pl(m[1], 'mistake', 'mistakes')],
  [/^已练 (\d+) 次$/, (m) => `${pl(m[1], 'attempt', 'attempts')} done`],
  [/^已跳过 (\d+) 个损坏的练习集$/, 'Skipped $1 damaged question sets'],
  [/^已修复 (\d+) 道异常题目$/, 'Repaired $1 invalid questions'],
  [/^剔除 (\d+) 题异常数据$/, 'Removed $1 invalid entries'],
  [/^修正 (\d+) 题题型$/, (m) => `Fixed the type of ${pl(m[1], 'question', 'questions')}`],
  [/^忽略 (\d+) 个没有有效题目的练习集$/, (m) => `Ignored ${pl(m[1], 'set', 'sets')} with no valid questions`],
  [/^忽略 (\d+) 道异常题目$/, (m) => `Ignored ${pl(m[1], 'invalid question', 'invalid questions')}`],
  [/^跳过 (\d+) 个已存在的练习集$/, (m) => `Skipped ${pl(m[1], 'set', 'sets')} already imported`],
  [/^跳过 (\d+) 份已存在的资料$/, (m) => `Skipped ${pl(m[1], 'material', 'materials')} already imported`],
  // 去重现在只看正文，话术也跟着改口径：不是「文件重名」，是「内容一样」
  [/^已跳过 (\d+) 份内容重复的资料$/, (m) => `Skipped ${pl(m[1], 'material', 'materials')} with the same content`],
  [/^文件 (\d+)$/, 'File $1'],
  [/^(\d+) 份失败$/, '$1 failed'],
  [/^按篇幅建议 (\d+) 题$/, (m) => `about ${pl(m[1], 'question', 'questions')} for this length`],
  [/^用练习科目默认 (\d+) 题（按篇幅建议 (\d+)）$/, 'subject default $1 (length suggests $2)'],
  [/^下一步：(.+)$/, (m) => `Next: ${t(m[1])}`],
  [/^第 (\d+) 段$/, 'Segment $1'],
  [/^第 (\d+) 题缺少题干$/, 'Question $1 has no stem'],
  [/^第 (\d+) 题（(单选|多选|判断|填空|编程)）缺少答案$/, (m) => `Question ${m[1]} (${t(m[2])}) has no answer`],
  [/^第 (\d+) 题（(单选|多选)）至少需要 2 个选项$/, (m) => `Question ${m[1]} (${t(m[2])}) needs at least 2 options`],
  [/^第 (\d+) 题（(单选|多选)）answer 必须是有效(索引数组|选项索引)$/,
    (m) => `Question ${m[1]} (${t(m[2])}): the answer must be a valid ${m[3] === '索引数组' ? 'index array' : 'option index'}`],
  [/^缺少练习集名称 name$/, 'The question set is missing its name'],
  [/^跨段重复，已合并$/, 'duplicated across segments and merged'],
  [/^(.+)跨段重复，已合并$/, (m) => `${m[1]} duplicated across segments and merged`],
  [/^(.+)没有返回题目，请重试$/, (m) => `${m[1]} returned no questions — try again`],
  [/^(.+)逐题保留，不改写不删减$/, (m) => `${m[1]} every question kept verbatim, nothing rewritten or dropped`],
  [/^原文识别到约 (\d+) 道题号，本次整理出 (\d+) 道，可能有漏题$/,
    'About $1 question numbers found in the source; $2 were tidied this time — some may be missing'],
  [/^正在解析 (\d+)\/(\d+)：(.+)$/, 'Parsing $1/$2: $3'],
  [/^查看 前 (\d+) 条（共 (\d+) 条）提示$/, (m) => `Review the first ${m[1]} of ${pl(m[2], 'hint', 'hints')}`],
  [/^查看 (\d+) 条提示$/, (m) => `Review ${pl(m[1], 'hint', 'hints')}`],
  [/^「(.+?)」还是空的$/, '"$1" is still empty'],
  [/^笔记 (\d+) 份 · ([\d,]+) 字$/, (m) => `${pl(m[1], 'note', 'notes')} · ${m[2]} chars`],
  [/^真题 (\d+) 份 · ([\d,]+) 字$/, (m) => `${pl(m[1], 'past paper', 'past papers')} · ${m[2]} chars`],
  [/^(\d+) 个 · (\d+) 题$/, (m) => `${pl(m[1], 'set', 'sets')} · ${pl(m[2], 'question', 'questions')}`],
  [/^(\d+) 知识点$/, (m) => pl(m[1], 'key point', 'key points')],
  [/^仅文字$/, 'text only'],
  [/^原始文件未保存$/, 'original file not stored'],
  [/^服务正在更新，自动重连中（第 (\d+) 次）…$/, 'The service is updating — reconnecting (attempt $1)…'],
  [/^当前页面不支持后端服务（HTTP 405）(.+)$/,
    'This page has no backend (HTTP 405) — code judging needs the hosted site$1'],
  [/^知识点 (\d+)$/, 'Key point $1'],
  [/^移除 (\d+)$/, 'Remove $1'],
  [/^质检：(.+)$/, 'Quality check: $1'],
  [/^（用这 (\d+) 份资料）$/, (m) => ` (using ${plThis(m[1], 'file', 'files')})`],
  [/^（真题原文 ([\d,]+) · 笔记生成 (\d+)）$/, '(source papers $1 · new questions $2)'],
  [/^已建好「(.+?)」$/, 'Created "$1"'],
  [/^备考规划考点「(.+?)」$/, (m) => `Exam Plan topic "${m[1]}"`],
  [/^考点「(.+?)」$/, 'Topic "$1"'],
  [/^目标考试：(.+)$/, 'Target exam: $1'],
  [/^所属单元：(.+)$/, 'Unit: $1'],
  [/^练习来源：(.+)$/, (m) => `Source: ${t(m[1])}`],
  [/^聚焦(.+)$/, 'Focused on $1'],
  /* 前缀 + 一整句话（「✕ 几乎没有提取到文字…」这类）：摘掉 ✓/✕，正文交给词典。
     摘符号是全站一条口径——词典里「✓ 已提取 → Extracted」「✕ 错误 → Incorrect」都这么做，
     状态由颜色和图标位承担，不该在英文字里再留一个中文排版用的符号。
     这条必须排在最后，也必须是「中间没有 ·」的那一句：一行里拼了几段的
     （「✓ 已提取 3 个文件 · 225 字 · 笔记 3 份」）要留给下面的逐段翻译，
     否则这条只会翻掉最后一段，前面几段原样漏在过去。 */
  [/^✓ ([^·]+)$/, (m) => lookup(m[1]) || m[1]],
  [/^✕ ([^·]+)$/, (m) => lookup(m[1]) || m[1]],
];

/* ---------- 语言状态 ---------- */

function getLang() {
  return _lang;
}

function isEn() {
  return _lang === 'en';
}

function persistLang(lang) {
  try { localStorage.setItem(LANG_PREF_KEY, lang); } catch { /* 偏好存不下也不影响本次使用 */ }
}

function initLang() {
  let saved = null;
  try { saved = localStorage.getItem(LANG_PREF_KEY); } catch { /* 读不到就用默认中文 */ }
  _lang = saved === 'en' ? 'en' : 'zh';
  document.documentElement.lang = _lang === 'en' ? 'en' : 'zh-CN';
  if (_lang === 'en') applyLang(document.documentElement);
  ensureLangObserver();
}

function setLang(next) {
  const lang = next === 'en' ? 'en' : 'zh';
  if (lang === _lang) return;
  _lang = lang;
  persistLang(lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  if (lang === 'zh') restoreZh(document.documentElement);
  if (typeof render === 'function') render(); else applyLang(document.documentElement);
}

function toggleLang() {
  setLang(isEn() ? 'zh' : 'en');
}

/* ---------- 查表 ---------- */

function lookup(raw, deep) {
  let core = String(raw).replace(/\s+/g, ' ').trim();
  if (!core) return null;
  // 文案被 <span>/<b> 拆成多个文本节点时，分隔符会悬在两端（「… · 已存入数据结构 · 」）。
  // 先摘下悬空的「·」，译文出来后再原样贴回去。
  let pre = '';
  let post = '';
  let cut;
  while ((cut = core.match(/^·\s+/))) { pre += '· '; core = core.slice(cut[0].length); }
  while ((cut = core.match(/\s+·$/))) { post = ' ·' + post; core = core.slice(0, core.length - cut[0].length); }
  if (!core) return null;
  const wrap = (val) => (!val || !(pre || post) ? val : pre + val + post);
  const exact = EN[core];
  if (typeof exact === 'string' && exact !== core) return wrap(exact);
  for (const [re, out] of EN_PATTERNS) {
    if (!re.test(core)) continue;
    if (typeof out === 'function') {
      const m = core.match(re);
      const val = out(m);
      return val && val !== core ? wrap(val) : null;
    }
    const val = core.replace(re, out);
    if (val !== core) return wrap(val);
  }
  // 「A · B · C」这类把若干小片段拼成一行的文案：整句查不到时逐段翻译，
  // 翻不动的片段（练习科目名、资料名等用户数据）原样保留。长文本不参与，避免误伤题干。
  if (deep !== false && core.length <= 90 && core.includes(' · ')) {
    const parts = core.split(' · ');
    const mapped = parts.map((p) => lookup(p, false));
    if (parts.some((p, i) => mapped[i] && mapped[i] !== p)) {
      return wrap(mapped.map((v, i) => v || parts[i]).join(' · '));
    }
  }
  return null;
}

/** 供代码内使用的即时翻译（模板里已经拼好的中文句子）。 */
function t(zh) {
  if (!isEn()) return zh;
  const hit = lookup(zh);
  return hit || zh;
}

/* 位置很紧的方形徽标（38px）：默认汉字图标换成短标记，
 * 用户自定义的图标字符不在表里，原样保留。 */
const TIGHT_BADGES = [
  ['.mini-icon, .detail-icon, .subject-dot', { '题': 'Q', '程': '</>' }],
];

function translateNodeValue(node) {
  const raw = node.nodeValue;
  if (raw == null || !HAN.test(raw)) return false;
  const core = raw.replace(/\s+/g, ' ').trim();
  // 方形小徽标只有 38px：单个汉字换成完整英文词会撑破盒子，改用固定短标记
  const tight = TIGHT_BADGES.find(([sel, map]) => map[core] && node.parentElement && node.parentElement.matches && node.parentElement.matches(sel));
  const en = tight ? tight[1][core] : lookup(raw);
  if (!en) return false;
  if (node.__zh == null) node.__zh = raw;
  const lead = (raw.match(/^[\s\u00a0]*/) || [''])[0];
  const trail = (raw.match(/[\s\u00a0]*$/) || [''])[0];
  node.nodeValue = lead + en + trail;
  return true;
}

function translateAttrs(el) {
  // 只有当元素被「外层」用户数据区块包住时才放行：资料名、题干这些不会命中词典，
  // 而 data-no-i18n 也用在语言切换器这类界面控件上，它们的 aria-label 属于界面文案，该翻。
  const marked = el.closest && el.closest('[data-no-i18n]');
  if (marked && marked !== el) return;
  for (const name of LANG_ATTRS) {
    if (!el.hasAttribute || !el.hasAttribute(name)) continue;
    const raw = el.getAttribute(name);
    if (!raw || !HAN.test(raw)) continue;
    const en = lookup(raw);
    if (!en) continue;
    if (!el.__zhAttrs) el.__zhAttrs = {};
    if (el.__zhAttrs[name] == null) el.__zhAttrs[name] = raw;
    el.setAttribute(name, en);
  }
}

/* ---------- DOM 遍历 ---------- */

function walkText(root, fn, onlyHan) {
  if (root.nodeType === 3) {
    // observer 直接送来文本节点时也要走同一道闸门：跳过标签白名单和用户内容容器
    const parent = root.parentElement;
    if (!parent || SKIP_TAGS[parent.tagName] || parent.closest('[data-no-i18n]')) return;
    fn(root);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS[parent.tagName]) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
      const value = node.nodeValue;
      if (onlyHan) return value && HAN.test(value) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      return typeof node.__zh === 'string' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let node;
  while ((node = walker.nextNode())) fn(node);
}

function applyLang(root) {
  if (!root || !isEn()) return;
  walkText(root, translateNodeValue, true);
  if (root.querySelectorAll) {
    for (const el of root.querySelectorAll(LANG_ATTRS.map((a) => `[${a}]`).join(','))) translateAttrs(el);
  }
}

function restoreZh(root) {
  if (!root) return;
  walkText(root, (node) => {
    node.nodeValue = node.__zh;
    node.__zh = null;
  }, false);
  if (root.querySelectorAll) {
    for (const el of root.querySelectorAll('*')) {
      if (!el.__zhAttrs) continue;
      for (const [name, raw] of Object.entries(el.__zhAttrs)) el.setAttribute(name, raw);
      el.__zhAttrs = null;
    }
  }
}

/* 弹窗、toast、异步状态文字都绕开 render()，用 observer 兜底补翻译。
   回调里同步处理新增子树，避免英文晚一帧才出现；翻译后的文本不再命中词典，因此不会自激循环。 */
let _langObserver = null;

function ensureLangObserver() {
  if (_langObserver || typeof MutationObserver === 'undefined') return;
  _langObserver = new MutationObserver((records) => {
    if (!isEn()) return;
    for (const r of records) {
      if (r.type === 'childList') {
        r.addedNodes.forEach((node) => applyLang(node));
      } else if (r.type === 'characterData') {
        applyLang(r.target);
      } else if (r.target && r.target.nodeType === 1) {
        translateAttrs(r.target);
      }
    }
  });
  _langObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: LANG_ATTRS,
  });
}

/* 采集模式：__i18nDump() 输出当前页面所有含中文的可见文本，用于补齐词典。
   data-no-i18n 是用户数据（练习科目名、题目标题、品牌字），不算词典缺口，跳过。 */
window.__i18nDump = function __i18nDump() {
  const found = new Set();
  walkText(document.body, (node) => found.add(node.nodeValue.replace(/\s+/g, ' ').trim()), true);
  for (const el of document.body.querySelectorAll(LANG_ATTRS.map((a) => `[${a}]`).join(','))) {
    if (el.closest && el.closest('[data-no-i18n]')) continue;
    for (const name of LANG_ATTRS) {
      const raw = el.getAttribute && el.getAttribute(name);
      if (raw && HAN.test(raw)) found.add(`@${name} ${raw.replace(/\s+/g, ' ').trim()}`);
    }
  }
  return [...found];
};

/* 脚本放在 app.js 之前：先恢复语言偏好，再让首次渲染按当前语言出文字。 */
initLang();
