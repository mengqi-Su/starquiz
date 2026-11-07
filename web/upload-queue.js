/* 一批资料的读取，全站只这一份实现（新建向导、科目页、AI 弹窗三个入口共用）：
   并发 2、每份状态看得见、能停下、失败的那几份能单独重来、读满预算就停。
   以前这里是 for 循环一份份解析：第 3 份卡住时界面只剩一句「正在解析 3/20」，
   用户既停不下来，也不知道后面还有几份没读，只能刷新把整批丢掉。
   口径与 Exam Plan 的 src/lib/uploadQueue.ts 一致——同一件事在两端不该有两种说法。 */
(function () {
  'use strict';

  /** 同时读两份：解析是 CPU 活，再并发下去只会互相抢主线程，界面更卡。 */
  var UPLOAD_CONCURRENCY = 2;
  /** 一批的可见字数预算：约等于一本 600 页的书。真超了该分两批传，而不是一次塞满内存。 */
  var UPLOAD_CHAR_BUDGET = 600000;

  function uploadTaskKey(file) {
    return (file && file.name ? String(file.name) : 'file') + ':' + (file && file.size ? file.size : 0);
  }

  /** 先把全部列出来（queued），界面立刻有东西可显示，不用等第一份读完才结账。 */
  function toUploadTasks(files, keepKeys) {
    return files.map(function (file, index) {
      var key = uploadTaskKey(file);
      return {
        key: keepKeys && keepKeys[key] ? keepKeys[key] : key + '#' + index,
        name: file && file.name ? String(file.name) : '文件 ' + (index + 1),
        sizeBytes: file && file.size ? file.size : 0,
        state: 'queued',
        chars: 0,
        error: ''
      };
    });
  }

  /** 还剩多少份没读：取消之后要说清这个数，只说「已取消」等于没说完。 */
  function pendingUploadCount(tasks) {
    return tasks.filter(function (t) { return t.state === 'queued' || t.state === 'working'; }).length;
  }

  function countByState(tasks, state) {
    return tasks.filter(function (t) { return t.state === state; }).length;
  }

  /* 队列里放的是「第几号任务 + 对应文件」：靠下标配对，比在数组里反查稳当——
     同名同大小的两份文件本就该各算一份。 */
  async function runUploadQueue(files, options) {
    var opts = options || {};
    var concurrency = Math.max(1, opts.concurrency || UPLOAD_CONCURRENCY);
    var budget = typeof opts.charBudget === 'number' ? opts.charBudget : UPLOAD_CHAR_BUDGET;
    var textOf = opts.textOf || function (value) { return (value && value.text) || ''; };
    // 「多少字」全站一种算法（空白不计入）；具体用哪个函数由调用方给，这里不自己发明第二份
    var countChars = opts.countChars || function (text) { return String(text || '').replace(/\s/g, '').length; };
    var tasks = toUploadTasks(files, opts.keepKeys);
    var slots = tasks.map(function (task, index) { return { task: task, file: files[index] }; });
    var emit = function () { if (opts.onTasks) opts.onTasks(tasks.slice()); };
    var results = new Map();
    var cursor = 0;
    var totalChars = 0;
    var budgetReached = false;
    var cancelRequested = false;

    function cancelled() {
      return cancelRequested || (opts.isCancelled ? !!opts.isCancelled() : false);
    }

    emit();

    async function worker() {
      for (;;) {
        if (cancelled()) { cancelRequested = true; return; }
        if (cursor >= slots.length) return;
        var slot = slots[cursor];
        cursor += 1;
        /* 预算用满之后不再往下读：剩下这些不是坏了，是这一批装不下，
           所以它们不能和被拒的文件共用一句「读不出来」。 */
        if (budgetReached) { slot.task.state = 'over-budget'; emit(); continue; }
        slot.task.state = 'working';
        emit();
        try {
          var value = await opts.run(slot.file, slot.task);
          var chars = countChars(textOf(value));
          slot.task.chars = chars;
          slot.task.state = 'done';
          totalChars += chars;
          results.set(slot.task.key, { key: slot.task.key, name: slot.task.name, value: value, chars: chars });
          if (totalChars >= budget) budgetReached = true;
        } catch (e) {
          slot.task.state = 'failed';
          slot.task.error = (e && e.message) || '解析失败';
        }
        emit();
      }
    }

    var workers = [];
    for (var w = 0; w < Math.min(concurrency, slots.length); w++) workers.push(worker());
    await Promise.all(workers);

    /* 取消时还剩两类：连开始都没开始的，和给预算让路的。两者都只是没轮到，不是出错。 */
    function settle(state) {
      var changed = false;
      slots.forEach(function (slot) {
        if (slot.task.state !== 'queued') return;
        slot.task.state = state;
        changed = true;
      });
      if (changed) emit();
    }
    if (cancelRequested) settle('cancelled');
    if (budgetReached) settle('over-budget');

    return {
      // done 保持上传顺序：资料列表按用户选文件的顺序出现，而不是按谁先解析完
      done: tasks.map(function (t) { return results.get(t.key); }).filter(Boolean),
      failed: tasks.filter(function (t) { return t.state === 'failed'; }),
      cancelled: tasks.filter(function (t) { return t.state === 'cancelled'; }),
      overBudget: tasks.filter(function (t) { return t.state === 'over-budget'; }),
      chars: totalChars,
      budgetReached: budgetReached
    };
  }

  /** 只重跑失败那几份：成功的不该被再读一遍，那既慢又会在资料库里造出双胞胎。 */
  function pickFailedFiles(files, tasks) {
    var keepKeys = {};
    var byIndex = new Map();
    tasks.forEach(function (task) {
      if (task.state !== 'failed') return;
      var match = /#(\d+)$/.exec(task.key);
      if (match) byIndex.set(Number(match[1]), task.key);
    });
    var picked = [];
    files.forEach(function (file, index) {
      var key = byIndex.get(index);
      if (!key) return;
      picked.push(file);
      keepKeys[uploadTaskKey(file)] = key;
    });
    return { files: picked, keepKeys: keepKeys };
  }

  /* 一句结果话：失败与「没轮到」分开说，前者是这件事没做成，后者只是这一批的边界。
     红底还是纸底由调用方定。 */
  /* 面板上每句话在这里只拼中文，英文交给词典：句子从此只有一套说法。
     以前这里自带一份英文，于是模块说「Read 1 file(s)」、词典说「Read 1 files」，
     同一个队列切英文出现两个口径——计数也漏了单数。 */
  function say(zh) {
    return typeof t === 'function' ? t(zh) : zh;
  }

  function uploadOutcomeNotice(outcome) {
    var parts = [];
    if (outcome.overBudget && outcome.overBudget.length > 0) {
      parts.push(say('这一批读到 ' + outcome.done.length + ' 份、共 ' + outcome.chars.toLocaleString() + ' 字，单批预算已用满，剩下 ' + outcome.overBudget.length + ' 份没有读，请分两批再传'));
    }
    if (outcome.cancelled && outcome.cancelled.length > 0) {
      parts.push(say('已取消，剩下 ' + outcome.cancelled.length + ' 份没有读'));
    }
    return parts.join(' ');
  }

  function uploadStateLabel(task) {
    switch (task.state) {
      case 'done': return say((task.chars || 0).toLocaleString() + ' 字');
      case 'failed': return say('读不出');
      case 'cancelled': return say('没读');
      case 'over-budget': return say('留到下一批');
      case 'working': return say('读取中');
      default: return say('排队中');
    }
  }

  /* 队列面板：三个入口共用同一段 DOM。这里刻意不拼 HTML——文件名是用户手上的字符串，
     走 textContent 就无需再引一份转义函数（全站转义只 app.js 里那一份，也不给 SEC-05 再添面）。 */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderUploadQueue(container, tasks, running, handlers) {
    if (!container) return;
    var h = handlers || {};
    container.textContent = '';
    if (!tasks || !tasks.length) { container.hidden = true; return; }
    container.hidden = false;
    var done = countByState(tasks, 'done');
    var failed = countByState(tasks, 'failed');
    var pending = pendingUploadCount(tasks);

    var head = el('div', 'uq-head');
    head.appendChild(el('span', 'uq-title', running
      ? say('读取资料 ' + done + '/' + tasks.length)
      : say('这一批读了 ' + done + ' 份')));
    var actions = el('span', 'uq-actions');
    if (running) {
      actions.appendChild(btn(say('取消（还剩 ' + pending + ' 份）'), h.onCancel));
    } else {
      if (failed > 0) actions.appendChild(btn(say('重试失败的 ' + failed + ' 份'), h.onRetry));
      actions.appendChild(btn(say('收起'), h.onDismiss));
    }
    head.appendChild(actions);
    container.appendChild(head);

    var list = el('ul', 'uq-list');
    tasks.forEach(function (task) {
      var row = el('li', 'uq-row');
      row.appendChild(el('span', 'uq-dot ' + task.state));
      row.appendChild(el('span', 'uq-name', task.name));
      var state = el('span', 'uq-state' + (task.state === 'failed' ? ' failed' : ''), uploadStateLabel(task));
      if (task.state === 'failed' && task.error) state.title = task.error;
      row.appendChild(state);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  function btn(label, onClick) {
    var node = el('button', 'uq-btn', label);
    node.type = 'button';
    if (onClick) node.addEventListener('click', onClick);
    return node;
  }

  /* 只露外面真会调的那几个。建任务、按状态计数这些是面板自己的 internals，
     模块内部已在用；再挂一份同名出口就是给同一个功能开第二个入口。 */
  window.UploadQueue = {
    UPLOAD_CONCURRENCY: UPLOAD_CONCURRENCY,
    run: runUploadQueue,
    pickFailedFiles: pickFailedFiles,
    notice: uploadOutcomeNotice,
    stateLabel: uploadStateLabel,
    render: renderUploadQueue
  };
})();
