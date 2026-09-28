const env = require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/db');
const { getRedis } = require('./config/redis');
const { startRescanner } = require('./jobs/urlRescanner');

async function main() {
  await connectDB();
  getRedis(); // start connecting; app works even if Redis never comes up
  if (env.ENABLE_RESCANNER) startRescanner();
  const server = app.listen(env.PORT, () => console.log(`[server] listening on :${env.PORT}`));

  const shutdown = () => { console.log('shutting down'); server.close(() => process.exit(0)); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((e) => { console.error('Fatal startup error:', e); process.exit(1); });
