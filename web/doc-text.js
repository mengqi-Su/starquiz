// 旧版 Word（Word 97-2003 二进制 / .doc）纯文本提取
// 不依赖第三方库：先解析 OLE 复合文档（CFB），再读 WordDocument 流的 piece table 还原正文。
// 常见场景：WPS/老版 Office 保存的 .doc，或扩展名写成 .docx 其实是 .doc 的文件。

const END_OF_CHAIN = 0xfffffffe;
const FREE_SECT = 0xffffffff;

// 文件头就是 OLE 复合文档（而不是 docx 的 zip：PK）
export function isOleFile(bytes) {
  return !!bytes && bytes.length >= 8 &&
    bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 && bytes[5] === 0xb1 && bytes[6] === 0x1a && bytes[7] === 0xe1;
}

function decodeUtf16(bytes) {
  if (!bytes.length) return '';
  const even = bytes.length - (bytes.length % 2);
  return new TextDecoder('utf-16le').decode(bytes.subarray(0, even));
}

function decodeAnsi(bytes) {
  if (!bytes.length) return '';
  // 中文 Word 的 8 位分段通常是 GBK；纯 ASCII 或 GBK 解码失败时退回 Windows-1252
  try {
    const gbk = new TextDecoder('gbk', { fatal: true }).decode(bytes);
    return gbk;
  } catch {
    try {
      return new TextDecoder('windows-1252').decode(bytes);
    } catch {
      return new TextDecoder('utf-8').decode(bytes);
    }
  }
}

function parseCfb(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (!isOleFile(bytes)) throw new Error('not_ole');
  const sectorShift = dv.getUint16(0x1e, true);
  const sectorSize = 1 << sectorShift;
  if (sectorSize < 128 || sectorSize > 65536) throw new Error('bad_sector_size');
  const miniShift = dv.getUint16(0x20, true);
  const miniSize = 1 << miniShift;
  const numFatSectors = dv.getUint32(0x2c, true);
  const dirStart = dv.getUint32(0x30, true);
  const miniCutoff = dv.getUint32(0x38, true) || 4096;
  const miniFatStart = dv.getUint32(0x3c, true);
  const numMiniFatSectors = dv.getUint32(0x40, true);
  const difatStart = dv.getUint32(0x44, true);
  const numDifatSectors = dv.getUint32(0x48, true);
  const base = bytes.byteOffset;
  const seg = (offset, length) => new Uint8Array(bytes.buffer, base + offset, length);
  const sectorAt = (id) => (id + 1) * sectorSize;

  // DIFAT → 所有 FAT 扇区号
  const fatSectors = [];
  for (let i = 0; i < 109; i++) {
    const id = dv.getUint32(0x4c + i * 4, true);
    if (id !== FREE_SECT) fatSectors.push(id);
  }
  let difat = difatStart;
  for (let guard = 0; difat !== END_OF_CHAIN && difat !== FREE_SECT && guard <= numDifatSectors + 2; guard++) {
    const off = sectorAt(difat);
    if (off + sectorSize > bytes.length) break;
    const perSector = sectorSize / 4 - 1;
    for (let i = 0; i < perSector; i++) {
      const id = dv.getUint32(off + i * 4, true);
      if (id !== FREE_SECT) fatSectors.push(id);
    }
    difat = dv.getUint32(off + sectorSize - 4, true);
  }

  const fat = [];
  for (const id of fatSectors) {
    if (fat.length >= numFatSectors * (sectorSize / 4)) break;
    const off = sectorAt(id);
    if (off + sectorSize > bytes.length) break;
    for (let i = 0; i < sectorSize / 4; i++) fat.push(dv.getUint32(off + i * 4, true));
  }

  const chain = (start, table) => {
    const out = [];
    let id = start;
    let guard = 0;
    while (id !== END_OF_CHAIN && id !== FREE_SECT && id < table.length && guard++ < table.length + 8) {
      out.push(id);
      id = table[id];
    }
    return out;
  };

  const readFatStream = (start, size) => {
    const ids = chain(start, fat);
    const chunks = [];
    let total = 0;
    for (const id of ids) {
      const off = sectorAt(id);
      if (off + sectorSize > bytes.length) break;
      chunks.push(seg(off, sectorSize));
      total += sectorSize;
      if (size && total >= size) break;
    }
    const out = new Uint8Array(Math.min(total, size || total));
    let p = 0;
    for (const chunk of chunks) {
      if (p >= out.length) break;
      const take = Math.min(chunk.length, out.length - p);
      out.set(chunk.subarray(0, take), p);
      p += take;
    }
    return out;
  };

  // 目录
  const dirBytes = readFatStream(dirStart, 0);
  const entries = [];
  for (let off = 0; off + 128 <= dirBytes.length; off += 128) {
    const view = new DataView(dirBytes.buffer, dirBytes.byteOffset + off, 128);
    const nameLen = view.getUint16(64, true);
    const type = view.getUint8(66);
    if (!type) continue;
    const nameBytes = dirBytes.subarray(off, off + Math.max(0, Math.min(64, nameLen) - 2));
    const name = decodeUtf16(nameBytes);
    entries.push({
      name,
      type,
      start: view.getUint32(116, true),
      size: view.getUint32(120, true) || 0
    });
  }

  const root = entries.find((entry) => entry.type === 5);
  let miniFat = [];
  let miniStream = new Uint8Array(0);
  if (root) {
    miniStream = readFatStream(root.start, root.size);
    const miniFatBytes = readFatStream(miniFatStart, numMiniFatSectors * sectorSize);
    const mv = new DataView(miniFatBytes.buffer, miniFatBytes.byteOffset, miniFatBytes.byteLength);
    for (let i = 0; i * 4 + 4 <= miniFatBytes.length; i++) miniFat.push(mv.getUint32(i * 4, true));
  }

  const readMiniStream = (start, size) => {
    const ids = chain(start, miniFat);
    const out = new Uint8Array(size);
    let p = 0;
    for (const id of ids) {
      const off = id * miniSize;
      if (off + miniSize > miniStream.length || p >= size) break;
      const take = Math.min(miniSize, size - p);
      out.set(miniStream.subarray(off, off + take), p);
      p += take;
    }
    return out;
  };

  const streams = new Map();
  for (const entry of entries) {
    if (entry.type !== 2) continue;
    streams.set(entry.name, entry.size < miniCutoff
      ? readMiniStream(entry.start, entry.size)
      : readFatStream(entry.start, entry.size));
  }
  return { streams };
}

function cleanWordText(raw) {
  return String(raw || '')
    // 域代码：把 \x13 指令 \x14 结果 \x15 只保留结果
    .replace(/\x13[^\x13\x14\x15]*\x14/g, '')
    .replace(/[\x13\x14\x15]/g, '')
    .replace(/\x07/g, '\t')
    .replace(/[\x0b\x0c\r]/g, '\n')
    .replace(/\x1e/g, '-')
    .replace(/[\x00-\x08\x0e-\x1f]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// 读取 Word 97 二进制正文：piece table 结构可信就用它，否则退回 fcMin..fcMac
// 为什么不看 fComplex：Word 存盘时正文并不总是连成一段（Exam Plan 的回归样本
// graph-notes.doc 就是 fComplex=0 而正文分两截），只看标志位会把中间那 1KB 属性区
// 当正文读出来。改成让结构自己证明自己：分段要从 0 起、首尾相接、刚好收到 ccpText，
// 每段字节范围还得落在 WordDocument 里，任一条不成立才退回连续区。
// 与 Exam Plan 的 src/lib/legacyWord.ts 同一套算法，两端读数必须一致。
export function extractLegacyWordText(bytes) {
  const { streams } = parseCfb(bytes);
  const wd = streams.get('WordDocument');
  if (!wd || wd.length < 0x200) throw new Error('no_word_stream');
  const dv = new DataView(wd.buffer, wd.byteOffset, wd.byteLength);
  if (dv.getUint16(0, true) !== 0xa5ec) throw new Error('not_word97');

  const flags = dv.getUint16(0x0a, true);
  if (flags & 0x0100) throw new Error('encrypted_doc');
  const fExtChar = !!(flags & 0x1000);
  const tableName = (flags & 0x0200) ? '1Table' : '0Table';
  const table = streams.get(tableName) || streams.get('0Table') || streams.get('1Table') || new Uint8Array(0);
  const tdv = table.length >= 4 ? new DataView(table.buffer, table.byteOffset, table.byteLength) : null;

  const ccpText = Math.min(dv.getUint32(0x4c, true), 20 * 1024 * 1024);
  const fcClx = dv.getUint32(0x01a2, true);
  const lcbClx = dv.getUint32(0x01a6, true);

  const pieces = [];
  if (tdv && lcbClx > 0 && fcClx + lcbClx <= table.length) {
    let p = fcClx;
    const end = fcClx + lcbClx;
    // Prc 结构：0x01 + cbGrpprl(u16) + 数据，可能连续多个
    while (p < end && table[p] === 0x01) {
      const cb = tdv.getUint16(p + 1, true);
      p += 3 + cb;
    }
    if (p < end && table[p] === 0x02) {
      const lcb = tdv.getUint32(p + 1, true);
      const plc = p + 5;
      const count = Math.floor((lcb - 4) / 12);
      const pcdStart = plc + (count + 1) * 4;
      if (lcb > 0 && plc + lcb <= table.length && count > 0 && count <= 8000) {
        for (let i = 0; i < count; i++) {
          const cpStart = tdv.getUint32(plc + i * 4, true);
          const cpEnd = tdv.getUint32(plc + (i + 1) * 4, true);
          const fcRaw = tdv.getUint32(pcdStart + i * 8 + 2, true);
          const compressed = !!(fcRaw & 0x40000000);
          const fc = compressed ? (fcRaw & 0x3fffffff) >>> 1 : (fcRaw & 0x3fffffff);
          if (cpEnd <= cpStart) { pieces.length = 0; break; }
          const bytesNeeded = compressed ? cpEnd - cpStart : (cpEnd - cpStart) * 2;
          if (fc + bytesNeeded > wd.length) { pieces.length = 0; break; }
          pieces.push({ cpStart, cpEnd, fc, compressed });
        }
      }
      // 分段必须无缝：从 0 开始、一段接一段；知道 ccpText 就要求正好收到最后一个字符。
      if (pieces.length) {
        if (pieces[0].cpStart !== 0) pieces.length = 0;
        for (let i = 1; i < pieces.length && pieces.length; i++) {
          if (pieces[i].cpStart !== pieces[i - 1].cpEnd) pieces.length = 0;
        }
        if (pieces.length && ccpText > 0 && pieces[pieces.length - 1].cpEnd !== ccpText) pieces.length = 0;
      }
    }
  }

  let raw = '';
  if (pieces.length) {
    const limit = ccpText > 0 ? ccpText : pieces[pieces.length - 1].cpEnd;
    for (const piece of pieces) {
      if (piece.cpStart >= limit) continue;
      const chars = Math.min(piece.cpEnd, limit) - piece.cpStart;
      if (chars <= 0) continue;
      if (piece.compressed) {
        const start = piece.fc;
        const slice = wd.subarray(start, Math.min(wd.length, start + chars));
        raw += decodeAnsi(slice);
      } else {
        const start = piece.fc;
        const slice = wd.subarray(start, Math.min(wd.length, start + chars * 2));
        raw += decodeUtf16(slice);
      }
    }
  } else {
    const fcMin = dv.getUint32(0x18, true);
    const fcMac = dv.getUint32(0x1c, true);
    const end = Math.min(wd.length, fcMac || wd.length);
    if (fcMin < end) {
      raw = fExtChar
        ? decodeUtf16(wd.subarray(fcMin, end))
        : decodeAnsi(wd.subarray(fcMin, end));
    }
  }

  return cleanWordText(raw);
}
