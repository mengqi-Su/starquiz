const SAMPLE_SETS = [
  {
    id: 'modern-history',
    subjectId: 'sub-history',
    name: '中国近代史',
    description: '从鸦片战争到全民族抗战：条约、运动、革命与关键人物，用选择题和填空题串起时间线。',
    icon: '史',
    tags: ['历史', '文科', '考研'],
    knowledgePoints: [
      { id: 'kp1', title: '鸦片战争与《南京条约》', content: '1840—1842 年鸦片战争是中国近代史的开端。1842 年《南京条约》是中国近代第一个不平等条约：割香港岛、赔款 2100 万银元、开放广州厦门福州宁波上海五口通商、协定关税。' },
      { id: 'kp2', title: '洋务运动与甲午战争', content: '洋务运动（19 世纪 60—90 年代）以“自强”“求富”为口号，创办近代军事与民用工业。1894—1895 年甲午中日战争后签订《马关条约》：割台湾全岛及附属岛屿、澎湖列岛，赔款 2 亿两白银，增开通商口岸，允许日本在通商口岸设厂。' },
      { id: 'kp3', title: '戊戌变法与辛亥革命', content: '1898 年戊戌变法（百日维新）试图自上而下改革，失败。1911 年 10 月 10 日武昌起义爆发，史称辛亥革命；1912 年中华民国成立，清帝退位，结束了两千多年的君主专制制度。' },
      { id: 'kp4', title: '新文化运动与五四运动', content: '1915 年陈独秀创办《青年杂志》（后改名《新青年》），新文化运动高举“民主”与“科学”两面旗帜。1919 年五四运动因巴黎和会上中国外交失败而爆发，提出“外争主权，内除国贼”，是中国新民主主义革命的开端。' },
      { id: 'kp5', title: '中共成立与全民族抗战', content: '1921 年中共一大在上海召开，中国共产党成立。1931 年九一八事变后东北沦陷；1937 年七七事变（卢沟桥事变）标志全民族抗战开始；1945 年抗日战争取得胜利。' }
    ],
    questions: [
      {
        id: 'his-q1', type: 'single', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '中国近代史通常以哪一事件为开端？',
        options: ['甲午中日战争', '鸦片战争', '辛亥革命', '五四运动'],
        answer: 1,
        explanation: '1840 年爆发的鸦片战争改变了中国的社会性质，通常被视为中国近代史的开端。'
      },
      {
        id: 'his-q2', type: 'single', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '《南京条约》开放的通商口岸中，不包括下列哪一个？',
        options: ['广州', '厦门', '上海', '天津'],
        answer: 3,
        explanation: '《南京条约》开放广州、厦门、福州、宁波、上海五处为通商口岸，天津不在其中。'
      },
      {
        id: 'his-q3', type: 'tf', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '《南京条约》是中国近代史上第一个不平等条约。',
        answer: true,
        explanation: '1842 年签订的中英《南京条约》是中国近代第一个不平等条约，此后列强又强迫清政府签订了一系列不平等条约。'
      },
      {
        id: 'his-q4', type: 'multi', difficulty: 1,
        knowledgePointId: 'kp2',
        content: '洋务运动提出的主要口号有哪些？（多选）',
        options: ['自强', '求富', '扶清灭洋', '民主与科学'],
        answer: [0, 1],
        explanation: '洋务运动以“自强”“求富”为口号。“扶清灭洋”是义和团运动的口号，“民主与科学”是新文化运动的旗帜。'
      },
      {
        id: 'his-q5', type: 'single', difficulty: 2,
        knowledgePointId: 'kp2',
        content: '《马关条约》中割让给日本的是？',
        options: ['香港岛', '台湾全岛及所有附属各岛屿、澎湖列岛', '九龙司地方一区', '辽东半岛全境'],
        answer: 1,
        explanation: '1895 年《马关条约》规定中国割让台湾全岛及所有附属各岛屿、澎湖列岛给日本，并赔款 2 亿两白银。'
      },
      {
        id: 'his-q6', type: 'fill', difficulty: 1,
        knowledgePointId: 'kp3',
        content: '1911 年 10 月 10 日，武昌起义爆发。因这一年是农历辛亥年，这场革命被称为 ______ 革命。',
        answer: ['辛亥', '辛亥革命'],
        explanation: '1911 年是农历辛亥年，因此这场推翻清朝统治的革命被称为辛亥革命。'
      },
      {
        id: 'his-q7', type: 'single', difficulty: 1,
        knowledgePointId: 'kp4',
        content: '新文化运动高举的两面大旗是？',
        options: ['自强与求富', '民主与科学', '三民主义与共和', '实业救国与教育救国'],
        answer: 1,
        explanation: '新文化运动以“民主”和“科学”为旗帜，提倡新道德、新文学，反对旧道德、旧文学。'
      },
      {
        id: 'his-q8', type: 'tf', difficulty: 2,
        knowledgePointId: 'kp4',
        content: '五四运动爆发的直接导火索是巴黎和会上中国外交的失败。',
        answer: true,
        explanation: '1919 年巴黎和会决定把德国在山东的特权转让给日本，消息传回国内后引发五四运动。'
      },
      {
        id: 'his-q9', type: 'single', difficulty: 1,
        knowledgePointId: 'kp5',
        content: '中国共产党第一次全国代表大会召开于哪一年？',
        options: ['1919 年', '1921 年', '1927 年', '1931 年'],
        answer: 1,
        explanation: '1921 年 7 月，中共一大在上海召开，宣告中国共产党成立。'
      },
      {
        id: 'his-q10', type: 'fill', difficulty: 2,
        knowledgePointId: 'kp5',
        content: '1937 年 7 月 7 日，日军挑起 ______ 事变（又称卢沟桥事变），中国全民族抗战由此开始。',
        answer: ['七七', '卢沟桥', '七七事变', '卢沟桥事变'],
        explanation: '七七事变标志着日本全面侵华战争的开始，也标志着中国全民族抗战的开始。'
      }
    ]
  },
  {
    id: 'biology-basics',
    subjectId: 'sub-bio',
    name: '生物 · 细胞与遗传',
    description: '细胞结构、跨膜运输、光合与呼吸、遗传规律与生物进化，适合高中生物复习。',
    icon: '生',
    accent: 1,
    tags: ['生物', '理科', '高中'],
    knowledgePoints: [
      { id: 'kp1', title: '细胞的结构', content: '细胞是生物体结构和功能的基本单位。真核细胞有成形的细胞核，原核细胞没有。线粒体是有氧呼吸的主要场所，叶绿体是光合作用的场所，核糖体是蛋白质合成的场所。植物叶肉细胞还有细胞壁、叶绿体和大液泡。' },
      { id: 'kp2', title: '物质跨膜运输', content: '自由扩散和协助扩散属于被动运输，不消耗能量；主动运输需要载体蛋白并消耗能量，可以逆浓度梯度运输。' },
      { id: 'kp3', title: '光合作用与细胞呼吸', content: '光合作用在叶绿体中进行，以二氧化碳和水为原料，合成有机物并释放氧气。细胞呼吸分解有机物释放能量，有氧呼吸的主要场所是线粒体。' },
      { id: 'kp4', title: '遗传的基本规律', content: '孟德尔通过豌豆杂交实验提出基因的分离定律和自由组合定律。DNA 双螺旋结构由沃森和克里克提出，遗传信息通过转录和翻译控制蛋白质合成。' },
      { id: 'kp5', title: '变异与进化', content: '可遗传变异包括基因突变、基因重组和染色体变异。生物进化的实质是种群基因频率的改变，自然选择决定进化的方向。' }
    ],
    questions: [
      {
        id: 'bio-q1', type: 'single', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '真核细胞中进行有氧呼吸的主要场所是？',
        options: ['叶绿体', '核糖体', '线粒体', '高尔基体'],
        answer: 2,
        explanation: '线粒体是有氧呼吸的主要场所，被称为细胞的“动力车间”。叶绿体进行光合作用，核糖体合成蛋白质。'
      },
      {
        id: 'bio-q2', type: 'tf', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '原核细胞没有成形的细胞核。',
        answer: true,
        explanation: '原核细胞没有核膜包被的细胞核，只有拟核；真核细胞具有成形的细胞核。'
      },
      {
        id: 'bio-q3', type: 'multi', difficulty: 2,
        knowledgePointId: 'kp1',
        content: '与动物细胞相比，植物叶肉细胞特有的结构有哪些？（多选）',
        options: ['细胞壁', '叶绿体', '大液泡', '中心体'],
        answer: [0, 1, 2],
        explanation: '植物叶肉细胞具有细胞壁、叶绿体和大液泡，这些结构动物细胞没有。中心体存在于动物细胞和低等植物细胞中。'
      },
      {
        id: 'bio-q4', type: 'fill', difficulty: 1,
        knowledgePointId: 'kp3',
        content: '绿色植物进行光合作用的场所是 ______。',
        answer: ['叶绿体'],
        explanation: '叶绿体含有叶绿素等光合色素，是绿色植物进行光合作用的场所。'
      },
      {
        id: 'bio-q5', type: 'single', difficulty: 2,
        knowledgePointId: 'kp2',
        content: '主动运输与被动运输的主要区别是？',
        options: [
          '是否需要细胞膜',
          '是否顺浓度梯度、是否需要载体并消耗能量',
          '是否运输小分子物质',
          '是否发生在活细胞中'
        ],
        answer: 1,
        explanation: '主动运输需要载体蛋白并消耗能量，可以逆浓度梯度进行；被动运输顺浓度梯度，不消耗能量。'
      },
      {
        id: 'bio-q6', type: 'tf', difficulty: 1,
        knowledgePointId: 'kp4',
        content: '孟德尔通过豌豆杂交实验提出了基因的分离定律和自由组合定律。',
        answer: true,
        explanation: '孟德尔以豌豆为实验材料，通过杂交实验总结出分离定律和自由组合定律，被誉为“遗传学之父”。'
      },
      {
        id: 'bio-q7', type: 'single', difficulty: 2,
        knowledgePointId: 'kp4',
        content: 'DNA 双螺旋结构模型的提出者是？',
        options: ['孟德尔和摩尔根', '沃森和克里克', '达尔文和拉马克', '巴斯德和科赫'],
        answer: 1,
        explanation: '1953 年，沃森和克里克提出 DNA 双螺旋结构模型，为分子遗传学奠定了基础。'
      },
      {
        id: 'bio-q8', type: 'multi', difficulty: 2,
        knowledgePointId: 'kp5',
        content: '下列属于可遗传变异来源的有哪些？（多选）',
        options: ['基因突变', '基因重组', '染色体变异', '仅由环境引起的性状改变'],
        answer: [0, 1, 2],
        explanation: '可遗传变异包括基因突变、基因重组和染色体变异。仅由环境引起、遗传物质未改变的性状改变属于不可遗传变异。'
      },
      {
        id: 'bio-q9', type: 'fill', difficulty: 2,
        knowledgePointId: 'kp5',
        content: '现代生物进化理论认为，生物进化的实质是种群 ______ 的改变。',
        answer: ['基因频率'],
        explanation: '生物进化的实质是种群基因频率发生改变，自然选择使有利变异逐代积累。'
      },
      {
        id: 'bio-q10', type: 'single', difficulty: 2,
        knowledgePointId: 'kp4',
        content: '遗传信息转录形成的产物主要是？',
        options: ['DNA', 'mRNA', '蛋白质', '氨基酸'],
        answer: 1,
        explanation: '转录是以 DNA 为模板合成 mRNA 的过程；mRNA 再作为模板翻译成蛋白质。'
      }
    ]
  },
  {
    id: 'js-basics',
    subjectId: 'sub-code',
    name: 'JavaScript 基础',
    description: '涵盖变量、数据类型、函数、作用域等 JavaScript 核心基础知识，包含编程实践题。',
    icon: 'JS',
    tags: ['前端', '编程', '入门'],
    knowledgePoints: [
      { id: 'kp1', title: '变量与声明', content: 'JavaScript 使用 var、let、const 声明变量。let 和 const 是 ES6 引入的块级作用域声明，const 声明后不可重新赋值。' },
      { id: 'kp2', title: '数据类型', content: 'JS 有 7 种原始类型：string、number、boolean、null、undefined、symbol、bigint，以及 1 种引用类型 object。' },
      { id: 'kp3', title: '函数', content: '函数是一等公民，可以赋值给变量、作为参数传递。箭头函数 (=>) 是 ES6 的简洁写法，且不绑定自己的 this。' },
      { id: 'kp4', title: '作用域与闭包', content: '作用域决定了变量的可访问范围。闭包是指函数能够记住并访问它被创建时所在的作用域，即使函数在其他地方执行。' },
      { id: 'kp5', title: '数组方法', content: '常用数组方法：map（映射）、filter（过滤）、reduce（归约）、forEach（遍历）、find（查找）、some/every（判断）。' }
    ],
    questions: [
      {
        id: 'js-q1', type: 'single', difficulty: 1,
        knowledgePointId: 'kp1',
        content: '以下哪个关键字声明的变量可以被重新赋值？',
        options: ['const', 'let', 'freeze', 'static'],
        answer: 1,
        explanation: 'let 声明的变量可以重新赋值。const 声明的变量不可重新赋值（但对象属性可以修改）。freeze 和 static 不是 JS 的变量声明关键字。'
      },
      {
        id: 'js-q2', type: 'single', difficulty: 1,
        knowledgePointId: 'kp2',
        content: 'typeof null 的返回值是什么？',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        answer: 2,
        explanation: '这是 JavaScript 的一个历史遗留 bug。typeof null 返回 "object"，这是因为在 JS 最初实现中，值以 32 位存储，前 3 位表示类型标签，而 null 的所有位都是 0，与对象的标签相同。'
      },
      {
        id: 'js-q3', type: 'tf', difficulty: 1,
        knowledgePointId: 'kp3',
        content: '箭头函数有自己的 this 绑定。',
        answer: false,
        explanation: '箭头函数不绑定自己的 this，它会捕获所在上下文的 this 值。这就是为什么箭头函数不能用作构造函数。'
      },
      {
        id: 'js-q4', type: 'multi', difficulty: 2,
        knowledgePointId: 'kp2',
        content: '以下哪些是 JavaScript 的原始（primitive）数据类型？（多选）',
        options: ['string', 'object', 'symbol', 'undefined', 'array', 'bigint'],
        answer: [0, 2, 3, 5],
        explanation: 'JS 的 7 种原始类型：string、number、boolean、null、undefined、symbol、bigint。object 和 array 是引用类型，array 本质上是 object。'
      },
      {
        id: 'js-q5', type: 'fill', difficulty: 1,
        knowledgePointId: 'kp1',
        content: 'ES6 中，声明一个不可重新赋值的变量应使用关键字 ______。',
        answer: ['const'],
        explanation: 'const 声明一个块级作用域的常量，一旦赋值就不能重新赋值。'
      },
      {
        id: 'js-q6', type: 'single', difficulty: 2,
        knowledgePointId: 'kp4',
        content: '下面代码的输出是什么？\n\nfunction outer() {\n  let x = 10;\n  function inner() { console.log(x); }\n  return inner;\n}\nconst fn = outer();\nfn();',
        options: ['undefined', '10', 'null', '报错 ReferenceError'],
        answer: 1,
        explanation: '这是闭包的经典示例。inner 函数"记住"了 outer 函数作用域中的变量 x，即使 outer 已经执行完毕，通过闭包仍然可以访问 x 的值 10。'
      },
      {
        id: 'js-q7', type: 'single', difficulty: 2,
        knowledgePointId: 'kp5',
        content: '[1,2,3].map(x => x * 2) 的返回值是什么？',
        options: ['[2,4,6]', '6', '[1,2,3,1,2,3]', 'undefined'],
        answer: 0,
        explanation: 'map 方法对数组每个元素执行回调函数，返回一个新数组。这里每个元素乘以 2，所以结果是 [2,4,6]。'
      },
      {
        id: 'js-q8', type: 'tf', difficulty: 2,
        knowledgePointId: 'kp5',
        content: 'Array.prototype.reduce() 方法不会修改原数组。',
        answer: true,
        explanation: 'reduce 方法对数组元素进行累积处理，返回一个累积结果，不会修改原数组。它是纯函数式的操作。'
      },
      {
        id: 'js-q9', type: 'single', difficulty: 3,
        knowledgePointId: 'kp4',
        content: '以下代码中，var 和 let 的行为有什么区别？\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 100);\n}',
        options: [
          '都输出 3,3,3',
          '都输出 0,1,2',
          '第一组输出 3,3,3，第二组输出 0,1,2',
          '第一组输出 0,1,2，第二组输出 3,3,3'
        ],
        answer: 2,
        explanation: 'var 是函数作用域，循环结束后 i=3，所有回调共享同一个 i。let 是块级作用域，每次循环都会创建新的 j 绑定，回调各自捕获对应的值。'
      },
      {
        id: 'js-q10', type: 'code', difficulty: 2,
        knowledgePointId: 'kp5',
        language: 'javascript',
        content: '编写一个函数 sum(arr)，接收一个数字数组，返回所有元素之和。\n\n例如：sum([1, 2, 3, 4]) 应返回 10',
        template: 'function sum(arr) {\n  // 在这里写你的代码\n  \n}',
        testCases: [
          { input: 'console.log(sum([1, 2, 3, 4]))', expectedOutput: '10' },
          { input: 'console.log(sum([]))', expectedOutput: '0' },
          { input: 'console.log(sum([-1, 1]))', expectedOutput: '0' },
          { input: 'console.log(sum([10, 20, 30]))', expectedOutput: '60' }
        ],
        answer: 'function sum(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}',
        explanation: '使用 Array.prototype.reduce() 是最简洁的方式。初始值设为 0，这样空数组也能正确返回 0。也可以用 for 循环或 forEach 实现。'
      },
      {
        id: 'js-q11', type: 'code', difficulty: 3,
        knowledgePointId: 'kp3',
        language: 'javascript',
        content: '编写一个函数 isPalindrome(str)，判断一个字符串是否是回文（正读和反读一样）。\n忽略大小写，只考虑字母和数字字符。\n\n例如：\nisPalindrome("A man") → true（忽略非字母数字后为 "aman"，不对，应该是 "aman" 反过来 "nama"... 简化版：直接判断整个字符串反转是否相等）\n\n简化要求：直接将整个字符串转小写后判断是否等于其反转。',
        template: 'function isPalindrome(str) {\n  // 在这里写你的代码\n  \n}',
        testCases: [
          { input: 'console.log(isPalindrome("racecar"))', expectedOutput: 'true' },
          { input: 'console.log(isPalindrome("hello"))', expectedOutput: 'false' },
          { input: 'console.log(isPalindrome("Madam"))', expectedOutput: 'true' },
          { input: 'console.log(isPalindrome("a"))', expectedOutput: 'true' }
        ],
        answer: 'function isPalindrome(str) {\n  const lower = str.toLowerCase();\n  return lower === lower.split("").reverse().join("");\n}',
        explanation: '将字符串转为小写，然后用 split("") 拆成数组，reverse() 反转，join("") 拼回字符串，最后与原小写字符串比较。'
      }
    ]
  },
  {
    id: 'python-basics',
    subjectId: 'sub-code',
    name: 'Python 基础',
    description: 'Python 语言核心概念：数据类型、控制流、函数、列表推导式等，含编程实践题。',
    icon: 'PY',
    tags: ['编程', '入门', '数据科学'],
    knowledgePoints: [
      { id: 'kp1', title: '数据类型', content: 'Python 是动态类型语言。基本类型包括 int、float、str、bool，复合类型包括 list、tuple、dict、set。' },
      { id: 'kp2', title: '列表与元组', content: 'list 是可变的有序序列，tuple 是不可变的有序序列。列表用 [] 创建，元组用 () 创建。' },
      { id: 'kp3', title: '字典', content: 'dict 是键值对集合，用 {} 创建。键必须是不可变类型（str、int、tuple），值可以是任意类型。' },
      { id: 'kp4', title: '函数与 lambda', content: 'def 定义函数，lambda 创建匿名函数。Python 支持默认参数、可变参数 (*args, **kwargs)、关键字参数。' },
      { id: 'kp5', title: '列表推导式', content: '[expr for item in iterable if condition] 是 Python 最优雅的特性之一，可以用一行代码创建新列表。' }
    ],
    questions: [
      {
        id: 'py-q1', type: 'single', difficulty: 1,
        knowledgePointId: 'kp1',
        content: 'Python 中，type(3.14) 的结果是什么？',
        options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'number'>"],
        answer: 1,
        explanation: '3.14 是一个浮点数，Python 中浮点数的类型是 float。Python 没有 number 这个类型。'
      },
      {
        id: 'py-q2', type: 'single', difficulty: 1,
        knowledgePointId: 'kp2',
        content: '以下哪个操作会报错？',
        options: [
          'list.append(1)',
          'tuple + (1,)',
          'tuple[0] = 1',
          'list[0] = 1'
        ],
        answer: 2,
        explanation: '元组 (tuple) 是不可变的，不能通过索引赋值修改元素。list 是可变的可以修改，tuple 支持拼接和索引访问。'
      },
      {
        id: 'py-q3', type: 'tf', difficulty: 1,
        knowledgePointId: 'kp3',
        content: 'Python 字典的键 (key) 可以是列表 (list) 类型。',
        answer: false,
        explanation: '字典的键必须是可哈希的（不可变类型）。list 是可变类型，不可哈希，所以不能作为字典的键。可以用 tuple 代替。'
      },
      {
        id: 'py-q4', type: 'fill', difficulty: 1,
        knowledgePointId: 'kp5',
        content: '完成列表推导式：生成 1 到 5 的平方数列表 [1, 4, 9, 16, 25]\n[x**2 for x in ______]',
        answer: ['range(1,6)', 'range(1, 6)'],
        explanation: 'range(1, 6) 生成 1, 2, 3, 4, 5（不包含 6），对每个 x 计算 x 的平方。'
      },
      {
        id: 'py-q5', type: 'single', difficulty: 2,
        knowledgePointId: 'kp4',
        content: '以下函数定义中，哪个使用了可变参数？',
        options: [
          'def f(x):',
          'def f(x, y=1):',
          'def f(*args):',
          'def f(x: int):'
        ],
        answer: 2,
        explanation: '*args 表示可变位置参数，可以接收任意数量的位置参数，在函数内部以 tuple 形式存在。**kwargs 则是可变关键字参数。'
      },
      {
        id: 'py-q6', type: 'multi', difficulty: 2,
        knowledgePointId: 'kp1',
        content: '以下哪些是 Python 的不可变类型？（多选）',
        options: ['list', 'tuple', 'str', 'dict', 'int', 'set'],
        answer: [1, 2, 4],
        explanation: 'tuple、str、int 都是不可变类型。list、dict、set 是可变类型，可以在创建后修改内容。'
      },
      {
        id: 'py-q7', type: 'single', difficulty: 2,
        knowledgePointId: 'kp5',
        content: '[x for x in range(10) if x % 2 == 0] 的结果是什么？',
        options: [
          '[1, 3, 5, 7, 9]',
          '[0, 2, 4, 6, 8]',
          '[2, 4, 6, 8, 10]',
          '[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]'
        ],
        answer: 1,
        explanation: 'range(10) 生成 0~9，if x % 2 == 0 过滤出偶数：0, 2, 4, 6, 8。'
      },
      {
        id: 'py-q8', type: 'tf', difficulty: 2,
        knowledgePointId: 'kp4',
        content: 'Python 中 lambda 函数可以包含多条语句。',
        answer: false,
        explanation: 'lambda 函数只能包含一个表达式，不能有多条语句、不能有 return 语句（表达式本身就是返回值）。需要复杂逻辑时用 def。'
      },
      {
        id: 'py-q9', type: 'code', difficulty: 2,
        knowledgePointId: 'kp5',
        language: 'python',
        content: '编写一个函数 fizzbuzz(n)，返回一个列表，包含 1 到 n（含）的 FizzBuzz 结果：\n- 能被 3 和 5 同时整除 → "FizzBuzz"\n- 能被 3 整除 → "Fizz"\n- 能被 5 整除 → "Buzz"\n- 其他 → 数字本身（int 类型）\n\n例如：fizzbuzz(5) → [1, 2, "Fizz", 4, "Buzz"]',
        template: 'def fizzbuzz(n):\n    # 在这里写你的代码\n    pass',
        testCases: [
          { input: 'print(fizzbuzz(5))', expectedOutput: "[1, 2, 'Fizz', 4, 'Buzz']" },
          { input: 'print(fizzbuzz(3))', expectedOutput: "[1, 2, 'Fizz']" },
          { input: 'print(fizzbuzz(1))', expectedOutput: '[1]' }
        ],
        answer: 'def fizzbuzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append("FizzBuzz")\n        elif i % 3 == 0:\n            result.append("Fizz")\n        elif i % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(i)\n    return result',
        explanation: '经典 FizzBuzz 问题。注意要先判断 15（3和5的公倍数），再分别判断 3 和 5。也可以用列表推导式一行搞定。'
      },
      {
        id: 'py-q10', type: 'code', difficulty: 3,
        knowledgePointId: 'kp4',
        language: 'python',
        content: '编写一个函数 count_words(text)，统计字符串中每个单词出现的次数，返回一个字典。\n忽略大小写（全部转为小写统计）。\n\n例如：count_words("Hello world hello") → {"hello": 2, "world": 1}',
        template: 'def count_words(text):\n    # 在这里写你的代码\n    pass',
        testCases: [
          { input: 'print(sorted(count_words("Hello world hello").items()))', expectedOutput: "[('hello', 2), ('world', 1)]" },
          { input: 'print(sorted(count_words("a a a b b c").items()))', expectedOutput: "[('a', 3), ('b', 2), ('c', 1)]" }
        ],
        answer: 'def count_words(text):\n    words = text.lower().split()\n    result = {}\n    for w in words:\n        result[w] = result.get(w, 0) + 1\n    return result',
        explanation: '先用 lower() 转小写，split() 分割单词，然后遍历用 dict.get() 计数。也可以用 collections.Counter 更简洁地实现。'
      }
    ]
  }
];
