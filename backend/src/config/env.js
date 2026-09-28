require('dotenv').config();

const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: num(process.env.PORT, 4000),
  BASE_URL: process.env.BASE_URL || 'http://localhost:4000',
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  ML_TIMEOUT_MS: num(process.env.ML_TIMEOUT_MS, 1500),
  CACHE_TTL_SECONDS: num(process.env.CACHE_TTL_SECONDS, 3600),
  SHORTCODE_LENGTH: num(process.env.SHORTCODE_LENGTH, 7),
  MAX_CODE_RETRIES: num(process.env.MAX_CODE_RETRIES, 5),
  CLICK_RETENTION_DAYS: num(process.env.CLICK_RETENTION_DAYS, 90),
  ENABLE_RESCANNER: process.env.ENABLE_RESCANNER === 'true',
  RESCAN_CRON: process.env.RESCAN_CRON || '0 3 * * *',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
};

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !env[k]);
if (missing.length && env.NODE_ENV !== 'test') {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = env;
