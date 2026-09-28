// Needs the full stack running: docker compose up  (or backend+mongo+redis+ml)
const test = require('node:test');
const assert = require('node:assert');
const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function up() {
  try { return (await fetch(`${BASE}/health`)).ok; } catch { return false; }
}
const post = (body, headers = {}) =>
  fetch(`${BASE}/api/urls`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('shorten + redirect + alias collision + reserved alias + bad scheme', async (t) => {
  if (!(await up())) return t.skip(`backend not reachable at ${BASE}`);

  const alias = 'it' + Date.now().toString(36);
  const r1 = await post({ url: 'https://example.com/hello', customAlias: alias });
  assert.strictEqual(r1.status, 201);
  const created = await r1.json();
  assert.ok(created.classification.modelVersion !== undefined);

  const redirect = await fetch(`${BASE}/${alias}`, { redirect: 'manual' });
  assert.strictEqual(redirect.status, 302);
  assert.strictEqual(redirect.headers.get('location'), 'https://example.com/hello');

  assert.strictEqual((await post({ url: 'https://example.com/2', customAlias: alias })).status, 409); // collision
  assert.strictEqual((await post({ url: 'https://example.com', customAlias: 'admin' })).status, 400);   // reserved
  assert.strictEqual((await post({ url: 'javascript:alert(1)' })).status, 400);                         // scheme
  assert.strictEqual((await post({ url: 'http://169.254.169.254/' })).status, 400);                      // SSRF-ish
  assert.strictEqual((await fetch(`${BASE}/doesnotexist9`)).status, 404);
});

test('expired link returns 404', async (t) => {
  if (!(await up())) return t.skip('backend not reachable');
  // Manual step for the demo: create a link, then set expiresAt in the past in MongoDB and hit it.
  t.skip('manual: see docs/api.md "Testing expiry"');
});
