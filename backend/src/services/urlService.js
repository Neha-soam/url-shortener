const Url = require('../models/Url');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { generateCode, isValidAlias } = require('../utils/generateCode');
const { isReserved } = require('../utils/reservedWords');
const { validateUrl } = require('../utils/urlValidator');
const cache = require('./cacheService');
const { classifyUrl } = require('./mlService');
const { checkReachability } = require('./securityService');

const DUP_KEY = 11000;
const selfHost = () => new URL(env.BASE_URL).hostname;

const toPayload = (doc) => ({
  id: String(doc._id),
  url: doc.originalUrl,
  isMalicious: doc.isMalicious,
  expiresAt: doc.expiresAt || null,
});

function cacheTtl(expiresAt) {
  if (!expiresAt) return env.CACHE_TTL_SECONDS;
  const remaining = Math.floor((new Date(expiresAt) - Date.now()) / 1000);
  return Math.min(env.CACHE_TTL_SECONDS, remaining); // never cache past expiry
}

async function createShortUrl({ originalUrl, customAlias, expiresInDays, ownerId }) {
  // 1. validate destination (scheme, structure, private hosts, self-loop)
  const v = validateUrl(originalUrl, { selfHost: selfHost() });
  if (!v.ok) throw new AppError(400, v.reason);

  // 2. alias rules
  if (customAlias) {
    if (!isValidAlias(customAlias)) throw new AppError(400, 'Alias must be 3-30 chars: letters, numbers, _ or -');
    if (isReserved(customAlias)) throw new AppError(400, 'This alias is reserved');
  }

  // 3. ML classification + live reachability check: exactly once, here, run
  // concurrently since they're independent I/O calls (each fails open on
  // its own, so Promise.all is safe -- neither can reject).
  const [scan, reachability] = await Promise.all([
    classifyUrl(v.url),
    checkReachability(v.url, { timeoutMs: env.REACHABILITY_TIMEOUT_MS }),
  ]);

  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400 * 1000) : null;
  const base = { originalUrl: v.url, owner: ownerId || null, expiresAt, ...scan, reachability };

  // 4. insert; DB unique index is the source of truth for uniqueness
  let doc = null;
  if (customAlias) {
    try {
      doc = await Url.create({ ...base, shortCode: customAlias });
    } catch (e) {
      if (e.code === DUP_KEY) throw new AppError(409, 'Alias already in use');
      throw e;
    }
  } else {
    for (let attempt = 1; attempt <= env.MAX_CODE_RETRIES && !doc; attempt++) {
      try {
        doc = await Url.create({ ...base, shortCode: generateCode(env.SHORTCODE_LENGTH) });
      } catch (e) {
        if (e.code !== DUP_KEY) throw e;
        console.warn(`[collision] shortCode collision, attempt ${attempt}/${env.MAX_CODE_RETRIES}`);
      }
    }
    if (!doc) throw new AppError(503, 'Could not allocate a unique short code, please retry');
  }

  // 5. warm the cache
  await cache.set(doc.shortCode, toPayload(doc), cacheTtl(doc.expiresAt));
  return doc;
}

/** Redirect hot path: Redis -> MongoDB fallback. No ML, no network fetches. */
async function resolve(shortCode) {
  const cached = await cache.get(shortCode);
  if (cached) {
    if (cached.expiresAt && new Date(cached.expiresAt) <= new Date()) {
      await cache.del(shortCode);
      return null;
    }
    return cached;
  }
  const doc = await Url.findOne({ shortCode }).lean();
  if (!doc) return null;
  if (doc.expiresAt && new Date(doc.expiresAt) <= new Date()) return null;

  const payload = toPayload(doc);
  await cache.set(shortCode, payload, cacheTtl(doc.expiresAt));
  return payload;
}

async function deleteUrl(id, ownerId) {
  const doc = await Url.findOneAndDelete({ _id: id, owner: ownerId });
  if (!doc) throw new AppError(404, 'URL not found');
  await cache.del(doc.shortCode); // avoid serving a deleted link from cache
  return doc;
}

const listByOwner = (ownerId) => Url.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(100).lean();

module.exports = { createShortUrl, resolve, deleteUrl, listByOwner };
