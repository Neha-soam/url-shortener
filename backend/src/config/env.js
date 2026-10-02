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

  // Email OTP (registration verification)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: num(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  OTP_EXPIRY_MINUTES: num(process.env.OTP_EXPIRY_MINUTES, 10),
  OTP_RESEND_COOLDOWN_SECONDS: num(process.env.OTP_RESEND_COOLDOWN_SECONDS, 45),
  OTP_MAX_ATTEMPTS: num(process.env.OTP_MAX_ATTEMPTS, 5),

  // Live reachability check (separate from the ML phishing check)
  REACHABILITY_TIMEOUT_MS: num(process.env.REACHABILITY_TIMEOUT_MS, 2500),
};

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !env[k]);
if (missing.length && env.NODE_ENV !== 'test') {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = env;
