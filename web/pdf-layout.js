// PDF 版面还原：把 pdf.js 的文字块按视觉位置重排成阅读顺序
// 纯函数，不依赖 DOM，方便单独测试。

function isWideChar(ch) {
  return !!ch && /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/.test(ch);
}

// 拼一行：中文之间不补空格；表格行用 | 保留列结构
function joinRow(cells) {
  const parts = [];
  let prevEnd = null;
  let prevSize = 0;
  for (const cell of cells) {
    if (!cell.str) continue;
    const size = cell.size || prevSize || 10;
    parts.push({ str: cell.str, gap: prevEnd == null ? 0 : cell.x - prevEnd, size });
    prevEnd = cell.x + (cell.width || 0);
    prevSize = size;
  }
  if (!parts.length) return '';
  const tableRow = parts.slice(1).filter((p) => p.gap > p.size * 1.2).length >= 2;
  let line = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i > 0) {
      const left = line.slice(-1);
      const right = p.str.charAt(0);
      const threshold = Math.max(0.8, Math.min(parts[i - 1].size, p.size) * 0.22);
      const beforePunct = /[，。！？；：、）》”’】」』,.!?;:)\]}]/.test(right);
      if (p.gap > threshold && !beforePunct) {
        if (tableRow && p.gap > p.size * 1.2) line += ' | ';
        else if (isWideChar(left) && isWideChar(right)) { /* 中文不补空格 */ }
        else line += p.gap > threshold * 8 ? '    ' : ' ';
      }
    }
    line += p.str;
  }
  return line.trim();
}

function toCells(items) {
  const cells = [];
  for (const item of items || []) {
    const str = typeof item.str === 'string' ? item.str : '';
    if (!str.trim()) continue;
    const tr = item.transform || [];
    const x = Number(tr[4]) || 0;
    const size = Math.abs(Number(tr[3]) || Number(tr[0]) || Number(item.height) || 10) || 10;
    cells.push({
      str,
      x,
      y: Number(tr[5]) || 0,
      width: Number(item.width) || 0,
      size
    });
  }
  return cells;
}

// 同一视觉行合并（允许 45% 字号抖动，兼容上下标和轻微基线偏移）
function groupRows(cells) {
  const sorted = [...cells].sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const rows = [];
  let bucket = [];
  let baseY = null;
  let rowSize = 10;
  const flush = () => {
    if (!bucket.length) return;
    bucket.sort((a, b) => a.x - b.x);
    const text = joinRow(bucket);
    if (text) {
      const left = Math.min(...bucket.map((c) => c.x));
      const right = Math.max(...bucket.map((c) => c.x + (c.width || 0)));
      rows.push({ text, left, right, center: (left + right) / 2, size: rowSize, y: baseY });
    }
    bucket = [];
  };
  for (const cell of sorted) {
    if (baseY == null) {
      bucket = [cell];
      baseY = cell.y;
      rowSize = cell.size;
      continue;
    }
    const tol = Math.max(2, Math.max(rowSize, cell.size) * 0.45);
    if (Math.abs(cell.y - baseY) <= tol) {
      bucket.push(cell);
      baseY = (baseY * 3 + cell.y) / 4;
      rowSize = Math.max(rowSize, cell.size);
    } else {
      flush();
      bucket = [cell];
      baseY = cell.y;
      rowSize = cell.size;
    }
  }
  flush();
  return rows;
}

// 在页面中部找双栏之间的 gutter。
// 判据：绝大多数文字块各自完整落在中线左侧或右侧，只有少量（标题、页脚）横跨中线。
function detectGutter(cells) {
  if (cells.length < 8) return null;
  const left = Math.min(...cells.map((c) => c.x));
  const right = Math.max(...cells.map((c) => c.x + (c.width || 0)));
  const width = right - left;
  if (width < 160) return null;

  const minX = left + width * 0.26;
  const maxX = left + width * 0.74;
  const step = Math.max(2, width / 200);
  let best = null;
  for (let x = minX; x <= maxX; x += step) {
    let leftCount = 0;
    let rightCount = 0;
    let crossing = 0;
    for (const cell of cells) {
      const cellRight = cell.x + (cell.width || 0);
      if (cellRight <= x - 4) leftCount++;
      else if (cell.x >= x + 4) rightCount++;
      else crossing++;
    }
    const minSide = Math.max(3, Math.ceil(cells.length * 0.2));
    if (leftCount < minSide || rightCount < minSide) continue;
    if (crossing > Math.max(2, cells.length * 0.2)) continue;
    const score = Math.min(leftCount, rightCount) - crossing * 2;
    if (!best || score > best.score) best = { x, score };
  }
  return best ? best.x : null;
}

function emitColumn(rows, out) {
  let prev = null;
  for (const row of rows) {
    if (prev) {
      const gap = prev.y - row.y;
      const size = Math.max(prev.size, row.size) || 10;
      // 正文行距通常是字号的 1.2–1.5 倍，1.9 倍以上才当成段落间距，避免每行都被拆开
      if (gap > size * 1.9) out.push('');
    }
    out.push(row.text);
    prev = row;
  }
}

// 返回这一页按阅读顺序排列的行
export function layoutPage(items, pageWidth, pageHeight = 0) {
  const cells = toCells(items);
  if (!cells.length) return [];
  const gutter = detectGutter(cells);

  if (!gutter) {
    const rows = groupRows(cells);
    const out = [];
    let prev = null;
    for (const row of rows) {
      if (prev && prev.y - row.y > Math.max(prev.size, row.size) * 1.9) out.push('');
      out.push(row.text);
      prev = row;
    }
    return out;
  }

  // 先按栏切分文字块，再各自成行，避免左右两栏被并进同一行
  const leftCells = [];
  const rightCells = [];
  const fullCells = [];
  for (const cell of cells) {
    const cellRight = cell.x + (cell.width || 0);
    if (cellRight <= gutter - 4) leftCells.push(cell);
    else if (cell.x >= gutter + 4) rightCells.push(cell);
    else fullCells.push(cell);
  }

  const tag = (rows, side) => rows.map((row) => ({ ...row, side }));
  const all = [
    ...tag(groupRows(leftCells), 'left'),
    ...tag(groupRows(rightCells), 'right'),
    ...tag(groupRows(fullCells), 'full')
  ].sort((a, b) => (b.y - a.y) || (a.left - b.left));

  // 页面最上/最下几条带内的行（页眉、页脚、页码）一律按整行处理
  if (pageHeight > 0) {
    for (const row of all) {
      if (row.y > pageHeight * 0.93 || row.y < pageHeight * 0.07) row.side = 'full';
    }
  }

  // 比两栏整体还高/还低的行（页眉、页脚、页码）按整行处理，不要塞进某一栏
  const body = all.filter((row) => row.side !== 'full');
  if (body.length) {
    const top = Math.max(...body.map((row) => row.y));
    const bottom = Math.min(...body.map((row) => row.y));
    for (const row of all) {
      const tol = Math.max(6, row.size * 1.5);
      if (row.side !== 'full' && (row.y > top + tol || row.y < bottom - tol)) row.side = 'full';
    }
  }

  const out = [];
  const leftBuf = [];
  const rightBuf = [];
  const flushColumns = () => {
    emitColumn(leftBuf, out);
    emitColumn(rightBuf, out);
    leftBuf.length = 0;
    rightBuf.length = 0;
  };

  for (const row of all) {
    if (row.side === 'left') leftBuf.push(row);
    else if (row.side === 'right') rightBuf.push(row);
    else {
      flushColumns();
      out.push(row.text);
    }
  }
  flushColumns();
  return out;
}

function normRunning(line) {
  return line.replace(/\d+/g, '#').replace(/\s+/g, '');
}

function isPageNumber(text) {
  if (/^[\s\-–—·•|]*\d{1,4}[\s\-–—·•|]*$/.test(text)) return true;
  if (/^(第\s*\d+\s*页|page\s*\d+)/i.test(text)) return true;
  return /^\d+\s*\/\s*\d+$/.test(text);
}

// 跨页去掉重复出现的页眉页脚、纯页码行；正文段落之间的空行要保留
export function dropRunningLines(pages) {
  if (!Array.isArray(pages) || !pages.length) return [];
  const seen = new Map();
  for (const lines of pages) {
    const texts = lines.map((line) => line.trim()).filter(Boolean);
    const picks = new Set([...texts.slice(0, 2), ...texts.slice(-2)]);
    for (const line of picks) {
      const key = normRunning(line);
      if (!key || key.length < 4) continue;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
  }
  const threshold = Math.max(2, Math.ceil(pages.length * 0.6));
  return pages.map((lines) => {
    const kept = [];
    let prevBlank = false;
    for (const line of lines) {
      const text = line.trim();
      if (!text) {
        // 连续空行只保留一个，且不放在页首
        if (kept.length && !prevBlank) {
          kept.push('');
          prevBlank = true;
        }
        continue;
      }
      if (isPageNumber(text)) continue;
      const key = normRunning(text);
      if (key.length >= 4 && key.length <= 48 && (seen.get(key) || 0) >= threshold) continue;
      kept.push(text);
      prevBlank = false;
    }
    while (kept.length && kept[kept.length - 1] === '') kept.pop();
    return kept;
  });
}
