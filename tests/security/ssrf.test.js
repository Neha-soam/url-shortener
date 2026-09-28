const test = require('node:test');
const assert = require('node:assert');
const { validateUrl, isPrivateIp } = require('../../backend/src/utils/urlValidator');

test('private / reserved IPv4 ranges are detected', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '0.0.0.0', '100.64.0.1']) {
    assert.ok(isPrivateIp(ip), ip);
  }
});

test('public IPv4 is not flagged', () => {
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '93.184.216.34']) assert.ok(!isPrivateIp(ip), ip);
});

test('IPv6 loopback / ULA / link-local / mapped-private are detected', () => {
  for (const ip of ['::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1']) assert.ok(isPrivateIp(ip), ip);
});

test('validateUrl blocks SSRF-style targets', () => {
  const bad = [
    'http://localhost/admin', 'http://127.0.0.1:6379', 'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/', 'http://service.internal/', 'http://printer.local/', 'http://foo.localhost/',
    'http://0.0.0.0/',
  ];
  for (const u of bad) assert.strictEqual(validateUrl(u).ok, false, u);
});

test('KNOWN LIMITATION: decimal/hex IP forms are normalised by WHATWG URL parser', () => {
  // new URL('http://2130706433/').hostname === '127.0.0.1' -> caught by the private-IP check
  assert.strictEqual(validateUrl('http://2130706433/').ok, false);
  assert.strictEqual(validateUrl('http://0x7f000001/').ok, false);
});
