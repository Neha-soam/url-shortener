const Redis = require('ioredis');
const env = require('./env');

let client = null;
let lastLog = 0;

// Redis is an optimisation, not a dependency: fail fast so redirects can fall back to MongoDB.
function getRedis() {
  if (client) return client;
  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  });
  client.on('error', (e) => {
    if (Date.now() - lastLog > 10000) { // throttle log noise
      console.error('[redis] error:', e.message);
      lastLog = Date.now();
    }
  });
  client.on('ready', () => console.log('[redis] ready'));
  return client;
}

module.exports = { getRedis };
