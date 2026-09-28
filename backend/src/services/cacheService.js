const { getRedis } = require('../config/redis');
const env = require('../config/env');

const key = (code) => `url:${code}`;
const stats = { hits: 0, misses: 0, errors: 0 };

// Every method swallows Redis errors -> redirects keep working via MongoDB.
async function get(code) {
  try {
    const raw = await getRedis().get(key(code));
    if (raw) { stats.hits++; return JSON.parse(raw); }
    stats.misses++;
    return null;
  } catch (e) {
    stats.errors++;
    return null;
  }
}

async function set(code, payload, ttlSeconds = env.CACHE_TTL_SECONDS) {
  try {
    if (ttlSeconds <= 0) return;
    await getRedis().set(key(code), JSON.stringify(payload), 'EX', Math.ceil(ttlSeconds));
  } catch (e) { stats.errors++; }
}

async function del(code) {
  try { await getRedis().del(key(code)); } catch (e) { stats.errors++; }
}

function getStats() {
  const total = stats.hits + stats.misses;
  return { ...stats, hitRate: total ? Number((stats.hits / total).toFixed(4)) : null };
}

module.exports = { get, set, del, getStats };
