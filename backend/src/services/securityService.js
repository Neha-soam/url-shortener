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
async function safeFetch(url, { timeoutMs = 3000, maxBytes = 512 * 1024, maxRedirects = 3, method = 'GET' } = {}) {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const v = validateUrl(current);
    if (!v.ok) throw new AppError(400, v.reason);
    await assertPublicHost(v.hostname);

    // Many sites (Codeforces, Cloudflare-protected sites, etc.) return 403 to
    // ANY request that doesn't look like a real browser -- no User-Agent is a
    // dead giveaway of a bot/scraper, even when the page is perfectly live.
    // Sending realistic headers isn't spoofing identity maliciously; it's
    // just not advertising "I am an automated script" when we don't need to.
    // This reduces false "unreachable/blocked" results, but can't eliminate
    // them -- some sites block ALL server-side requests regardless (see
    // checkReachability's doc comment and docs/decision-log.md #15).
    const res = await fetch(v.url, {
      method,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), v.url).toString();
      continue;
    }
    // HEAD has no body to read -- and some servers still send one anyway, so
    // don't assume; only drain the stream for methods that have a real body.
    if (method === 'HEAD' || !res.body) return { status: res.status, body: '' };

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

/**
 * Best-effort "is the destination actually up" check, separate from the ML
 * phishing classifier. Never throws and never blocks link creation --
 * fails open to status: 'unknown' on timeout/DNS failure/anything else,
 * because a slow or temporarily-down site isn't a reason to refuse the link.
 *
 * status: 'reachable' means we got *any* HTTP response (even a 404/500 --
 * that still proves a server exists and answered). 'unknown' means we
 * couldn't tell either way. httpStatus carries the real code when known,
 * so the UI can show e.g. "Reachable (404 Not Found)" instead of pretending
 * a dead page is the same as a healthy one.
 *
 * KNOWN LIMITATION: some sites (Codeforces, anything behind Cloudflare's bot
 * protection, etc.) return 401/403/429 to ANY server-side request, even
 * though the page is perfectly live for a real visitor's browser. Sending
 * browser-like headers above reduces this but can't eliminate it -- a 403
 * here means "something answered and refused us," which is a different,
 * weaker signal than a 404 ("something answered and the page genuinely
 * isn't there"). The frontend ReachabilityBadge treats them differently
 * for exactly this reason -- see docs/decision-log.md #15.
 */
async function checkReachability(url, { timeoutMs } = {}) {
  try {
    const res = await safeFetch(url, { method: 'HEAD', timeoutMs, maxRedirects: 3 });
    return { status: 'reachable', httpStatus: res.status, checkedAt: new Date() };
  } catch (err) {
    console.warn('[reachability] check failed:', err.message);
    return { status: 'unknown', httpStatus: null, checkedAt: new Date() };
  }
}

module.exports = { assertPublicHost, safeFetch, checkReachability };
