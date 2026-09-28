const dns = require('dns').promises;
const net = require('net');
const { isPrivateIp } = require('../utils/urlValidator');
const { validateUrl } = require('../utils/urlValidator');
const AppError = require('../utils/AppError');

/**
 * Resolve hostname and ensure EVERY resolved address is public.
 * Required before the server fetches any user-supplied URL (SSRF defence).
 */
async function assertPublicHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new AppError(400, 'Target resolves to a private/reserved address');
    return;
  }
  const addrs = await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new AppError(400, 'Target resolves to a private/reserved address');
  }
}

/**
 * SSRF-hardened fetch (used only by ADVANCED features such as semantic slugs).
 * - http/https only, public IPs only, re-validated on every redirect hop
 * - manual redirects (max 3), 3s timeout, 512KB body cap
 * Known limitation: DNS-rebinding between check and connect (TOCTOU). For production,
 * pin the resolved IP or fetch through an egress proxy.
 */
async function safeFetch(url, { timeoutMs = 3000, maxBytes = 512 * 1024, maxRedirects = 3 } = {}) {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const v = validateUrl(current);
    if (!v.ok) throw new AppError(400, v.reason);
    await assertPublicHost(v.hostname);

    const res = await fetch(v.url, { redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), v.url).toString();
      continue;
    }
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) { await reader.cancel(); break; }
      chunks.push(value);
    }
    return { status: res.status, body: Buffer.concat(chunks).toString('utf8') };
  }
  throw new AppError(400, 'Too many redirects');
}

module.exports = { assertPublicHost, safeFetch };
