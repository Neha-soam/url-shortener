const test = require('node:test');
const assert = require('node:assert');
const BASE = process.env.BASE_URL || 'http://localhost:4000';

test('POST /api/urls is rate limited (10/min/IP by default)', async (t) => {
  try { await fetch(`${BASE}/health`); } catch { return t.skip('backend not reachable'); }
  const statuses = [];
  for (let i = 0; i < 15; i++) {
    const r = await fetch(`${BASE}/api/urls`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://example.com/rl-${Date.now()}-${i}` }),
    });
    statuses.push(r.status);
  }
  assert.ok(statuses.includes(429), `expected a 429, got: ${statuses.join(',')}`);
});
