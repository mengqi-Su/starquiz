// 只给本机回归用的静态服务器：把仓库根目录摊到 http://127.0.0.1:<port>。
// 为什么要有它：dev/ 里的回归页面要能同时引到 ../web/index.html 和自己，
// 而 web/ 是发布目录，不该为了测试往里塞东西。线上站点也不带 dev/。
// 用法：node dev/serve.mjs [port]（默认 4401；只绑 127.0.0.1）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || 4401);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const name = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, name);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`starquiz dev server: http://127.0.0.1:${PORT}/  (root: ${ROOT})`);
  console.log(`xss regression:      http://127.0.0.1:${PORT}/dev/xss-regression.html`);
});
