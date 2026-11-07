// 冒烟测试：直接用 node 跑云函数 handler 的无凭据路径（不需要 Deno / API Key）。
// 覆盖请求闸门（functions/requestGuard.ts）：来源、Content-Type、按字节封顶的 body、限流分桶。
// 运行：node dev/function-smoke.mjs
import assert from 'node:assert/strict';

// 函数按 Deno 运行时写；本机用 node 的类型剥离跑同一段代码，只需要一个 env 读取垫片。
globalThis.Deno = { env: { get: (name) => process.env[name] ?? '' } };

const { handler } = await import('../functions/handler.ts');

const base = 'https://example.com/functions/v1/app';
const jsonType = { 'Content-Type': 'application/json' };

async function gate(path, headers, body) {
  const res = await handler(new Request(`${base}${path}`, { method: 'POST', headers, body }));
  return {
    status: res.status,
    data: await res.json(),
    retryAfter: res.headers.get('Retry-After'),
  };
}

console.log('starquiz function smoke checks (no API key)');

const health = await (async () => {
  const res = await handler(new Request(`${base}/health`, { method: 'GET' }));
  return { status: res.status, data: await res.json() };
})();
assert.equal(health.status, 200);
assert.equal(health.data.service, 'starquiz');
assert.equal(health.data.ai.configured, false);
assert.equal(health.data.judge.configured, false);
console.log('  ok  /health 只报能不能用，不报地址与凭证');

// 闸门在路由分发之前，所以来源与频率用例可以打在未启用的 /judge/run 上：
// 被限流时看到的是 429，而不是「判题未启用」的 503。
const crossOrigin = await gate('/judge/run', {
  ...jsonType,
  Origin: 'https://evil.example.com',
  'Sec-Fetch-Site': 'cross-site',
});
assert.equal(crossOrigin.status, 403, JSON.stringify(crossOrigin.data));
assert.equal(crossOrigin.data.error.code, 'cross_origin');
console.log('  ok  闸门：跨站页面借浏览器打我们 -> 403');

for (const origin of ['https://starquiz-zfc3er164xi.qoder.zone', 'http://127.0.0.1:4399', 'http://localhost:5173']) {
  const ok = await gate('/judge/run', { ...jsonType, Origin: origin, 'Sec-Fetch-Site': 'same-origin' }, '{}');
  // 未配置判题时应当走到业务分支给 503：能拿到 503 就说明闸门放行了
  assert.equal(ok.status, 503, `${origin} 应放行到业务层，实际 ${ok.status}`);
  assert.equal(ok.data.error.code, 'judge_not_configured');
}
const noOrigin = await gate('/judge/run', jsonType, '{}');
assert.equal(noOrigin.status, 503);
console.log('  ok  闸门：本站与本地来源放行，无 Origin 的调用（探活、发布后核对）也放行');

// 真正会读 body 的路由才谈得上体积与格式：/ai/start 先读 body，再判 Key。
const notJson = await gate('/ai/start', { 'Content-Type': 'text/plain' }, '{"materials":[]}');
assert.equal(notJson.status, 415, JSON.stringify(notJson.data));
assert.equal(notJson.data.error.code, 'unsupported_media_type');
console.log('  ok  闸门：非 JSON Content-Type 一律 415');

const brokenJson = await gate('/ai/start', jsonType, 'not-json-at-all');
assert.equal(brokenJson.status, 400, JSON.stringify(brokenJson.data));
assert.equal(brokenJson.data.error.code, 'bad_body');
console.log('  ok  闸门：body 不是 JSON 时给 bad_body');

// 上限按字节算：中文一字 3 字节，旧写法按字符判断等于把上限放宽三倍。
// /ai/start 的上限是 512 KB，20 万字节的资料应当在门口就被拦下，而不是先进内存再比较。
const tooBig = await gate('/ai/start', jsonType, JSON.stringify({ materials: [{ content: '字'.repeat(200_000) }] }));
assert.equal(tooBig.status, 413, JSON.stringify(tooBig.data));
assert.equal(tooBig.data.error.code, 'body_too_large');
console.log('  ok  闸门：按字节封顶的 body 超限即 413');

const declaredSmall = await gate(
  '/ai/start',
  { 'Content-Type': 'application/json', 'Content-Length': '16' },
  JSON.stringify({ materials: [{ content: '字'.repeat(200_000) }] })
);
assert.equal(declaredSmall.status, 413, JSON.stringify(declaredSmall.data));
assert.equal(declaredSmall.data.error.code, 'body_too_large');
console.log('  ok  闸门：Content-Length 撒谎时，流式读取仍然中止');

// 令牌桶按路由分两套：狂点「运行代码」不该把出题的额度一起吃光。
// 各用独立 IP，避免污染上面的用例。
const judgeIp = { ...jsonType, 'X-Forwarded-For': '203.0.113.21' };
let judgeLimited = null;
for (let i = 0; i < 40; i++) {
  const attempt = await gate('/judge/run', judgeIp, '{}');
  if (attempt.status === 429) judgeLimited = attempt;
  else assert.equal(attempt.status, 503, `第 ${i + 1} 次判题不该被限流：${JSON.stringify(attempt.data)}`);
}
assert.ok(judgeLimited, '狂点 40 次运行代码应当撞到判题桶');
assert.equal(judgeLimited.data.error.code, 'rate_limited');
assert.ok(Number(judgeLimited.retryAfter) >= 1, `429 要带 Retry-After，实际 ${judgeLimited.retryAfter}`);
const aiStillOpen = await gate('/ai/start', judgeIp, '{}');
assert.notEqual(aiStillOpen.status, 429, '判题桶用完不能牵连出题');
console.log(`  ok  闸门：判题 30 次突发之后限流（Retry-After ${judgeLimited.retryAfter}s），出题额度不受牵连`);

const aiIp = { ...jsonType, 'X-Forwarded-For': '203.0.113.22' };
let aiLimited = null;
for (let i = 0; i < 140; i++) {
  const attempt = await gate('/ai/start', aiIp, '{}');
  if (attempt.status === 429) aiLimited = attempt;
  else assert.equal(attempt.status, 503, `第 ${i + 1} 次出题不该被限流：${JSON.stringify(attempt.data)}`);
}
assert.ok(aiLimited, '一轮正常出题是几十个并发小请求，刷到 140 次应当撞到出题桶');
assert.equal(aiLimited.data.error.code, 'rate_limited');
console.log(`  ok  闸门：出题突发 120 次之后限流（Retry-After ${aiLimited.retryAfter}s）`);

// 额度按来源 IP 分桶：邻居被刷爆不该把新用户一起关在门外。
const freshIp = await gate('/ai/start', { ...jsonType, 'X-Forwarded-For': '203.0.113.23' }, '{}');
assert.equal(freshIp.status, 503);
console.log('  ok  闸门：限流按来源 IP 分桶，不牵连别人');

const wrongMethod = await handler(new Request(`${base}/ai/start`, { method: 'DELETE' }));
assert.equal(wrongMethod.status, 405);
const unknownRoute = await gate('/ai/nope', jsonType, '{}');
assert.equal(unknownRoute.status, 404, JSON.stringify(unknownRoute.data));
console.log('  ok  非 POST / 未知路由都有明确响应');

console.log('\nstarquiz function smoke checks passed');
