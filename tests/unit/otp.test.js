const test = require('node:test');
const assert = require('node:assert');
const { generateOtp, hashOtp, verifyOtp } = require('../../backend/src/utils/otp');

test('generateOtp always returns a 6-digit zero-padded string', () => {
  for (let i = 0; i < 500; i++) {
    const code = generateOtp();
    assert.match(code, /^\d{6}$/, `got "${code}"`);
  }
});

test('generateOtp has reasonable spread (not always the same digits)', () => {
  const codes = new Set();
  for (let i = 0; i < 1000; i++) codes.add(generateOtp());
  assert.ok(codes.size > 900, `expected close to 1000 unique codes, got ${codes.size}`);
});

test('hashOtp + verifyOtp round-trip', async () => {
  const code = '042519';
  const hash = await hashOtp(code);
  assert.notStrictEqual(hash, code); // never store the raw code
  assert.ok(await verifyOtp(code, hash));
  assert.ok(!(await verifyOtp('000000', hash)));
});
