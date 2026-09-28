const test = require('node:test');
const assert = require('node:assert');
const { validateUrl } = require('../../backend/src/utils/urlValidator');

test('accepts normal http/https URLs', () => {
  assert.ok(validateUrl('https://example.com/path?q=1').ok);
  assert.ok(validateUrl('http://example.com').ok);
});

test('rejects dangerous schemes', () => {
  for (const u of ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'file:///etc/passwd', 'ftp://x.com', 'gopher://x.com']) {
    assert.strictEqual(validateUrl(u).ok, false, u);
  }
});

test('rejects garbage, empty and over-long input', () => {
  assert.ok(!validateUrl('').ok);
  assert.ok(!validateUrl('not a url').ok);
  assert.ok(!validateUrl(12345).ok);
  assert.ok(!validateUrl('https://a.com/' + 'x'.repeat(3000)).ok);
});

test('rejects embedded credentials', () => {
  assert.ok(!validateUrl('https://user:pass@example.com').ok);
});

test('rejects redirect loop to own host', () => {
  assert.ok(!validateUrl('http://short.test/abc', { selfHost: 'short.test' }).ok);
});
