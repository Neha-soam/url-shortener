const test = require('node:test');
const assert = require('node:assert');

// securityService.checkReachability calls the GLOBAL fetch via safeFetch.
// We stub global.fetch so this test never touches the real network --
// it's testing our status-classification logic, not any particular website.
function withMockedFetch(responder, fn) {
  const real = global.fetch;
  global.fetch = responder;
  return fn().finally(() => { global.fetch = real; });
}

test('reachable: any HTTP response (even an error status) counts as reachable', async () => {
  delete require.cache[require.resolve('../../backend/src/services/securityService')];
  const { checkReachability } = require('../../backend/src/services/securityService');

  await withMockedFetch(
    async () => ({ status: 404, headers: new Map(), body: null }),
    async () => {
      const result = await checkReachability('https://example.com/missing-page', { timeoutMs: 100 });
      assert.strictEqual(result.status, 'reachable');
      assert.strictEqual(result.httpStatus, 404);
    }
  );
});

test('unknown: a thrown/timeout error never throws out of checkReachability, never blocks creation', async () => {
  delete require.cache[require.resolve('../../backend/src/services/securityService')];
  const { checkReachability } = require('../../backend/src/services/securityService');

  await withMockedFetch(
    async () => { throw new Error('ETIMEDOUT'); },
    async () => {
      const result = await checkReachability('https://example.com/slow', { timeoutMs: 100 });
      assert.strictEqual(result.status, 'unknown');
      assert.strictEqual(result.httpStatus, null);
    }
  );
});
