const test = require('node:test');
const assert = require('node:assert');
const { generateCode, isValidAlias } = require('../../backend/src/utils/generateCode');
const { isReserved } = require('../../backend/src/utils/reservedWords');

test('generateCode returns requested length and only base62 chars', () => {
  const c = generateCode(7);
  assert.strictEqual(c.length, 7);
  assert.match(c, /^[0-9A-Za-z]+$/);
});

test('generateCode has no collisions in 10,000 samples (7 chars)', () => {
  const s = new Set();
  for (let i = 0; i < 10000; i++) s.add(generateCode(7));
  assert.strictEqual(s.size, 10000);
});

test('alias validation', () => {
  assert.ok(isValidAlias('my-link_1'));
  assert.ok(!isValidAlias('ab'));
  assert.ok(!isValidAlias('has space'));
  assert.ok(!isValidAlias('../etc'));
});

test('reserved aliases are rejected (case-insensitive)', () => {
  assert.ok(isReserved('api'));
  assert.ok(isReserved('ADMIN'));
  assert.ok(!isReserved('my-link'));
});
