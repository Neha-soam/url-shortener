const net = require('net');

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa'];

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}

const V4_PRIVATE = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4],
].map(([base, bits]) => ({ base: ipv4ToInt(base), mask: (~0 << (32 - bits)) >>> 0 }));

function isPrivateIp(ip) {
  const version = net.isIP(ip);
  if (version === 4) {
    const n = ipv4ToInt(ip);
    return V4_PRIVATE.some(({ base, mask }) => ((n & mask) >>> 0) === ((base & mask) >>> 0));
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^f[cd]/.test(lower)) return true;           // fc00::/7 unique local
    if (/^fe[89ab]/.test(lower)) return true;         // fe80::/10 link-local
    if (/^ff/.test(lower)) return true;               // multicast
    return false;
  }
  return false;
}

/**
 * Validates a user-submitted destination URL.
 * Returns { ok: true, url, hostname } or { ok: false, reason }.
 * NOTE: this is a *syntactic* check. If the server ever FETCHES the URL,
 * also use securityService.assertPublicHost / safeFetch (DNS-level checks).
 */
function validateUrl(input, { maxLength = 2048, selfHost = null } = {}) {
  if (typeof input !== 'string') return { ok: false, reason: 'URL must be a string' };
  const raw = input.trim();
  if (!raw) return { ok: false, reason: 'URL is required' };
  if (raw.length > maxLength) return { ok: false, reason: `URL exceeds ${maxLength} characters` };

  let u;
  try { u = new URL(raw); } catch { return { ok: false, reason: 'Invalid URL format' }; }

  if (!ALLOWED_PROTOCOLS.has(u.protocol)) {
    return { ok: false, reason: `Scheme "${u.protocol}" is not allowed (only http/https)` };
  }
  if (u.username || u.password) return { ok: false, reason: 'URLs with embedded credentials are not allowed' };

  const host = u.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (!host) return { ok: false, reason: 'URL has no hostname' };
  if (host === 'localhost' || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return { ok: false, reason: 'Local/internal hostnames are not allowed' };
  }
  if (net.isIP(host) && isPrivateIp(host)) {
    return { ok: false, reason: 'Private or reserved IP addresses are not allowed' };
  }
  if (selfHost && host === selfHost.toLowerCase()) {
    return { ok: false, reason: 'Cannot shorten a link that points to this service (redirect loop)' };
  }
  return { ok: true, url: u.toString(), hostname: host };
}

module.exports = { validateUrl, isPrivateIp };
