const cron = require('node-cron');
const Url = require('../models/Url');
const env = require('../config/env');
const cache = require('../services/cacheService');
const { classifyUrl } = require('../services/mlService');

/** Re-scan links that were never scanned (ML was down) or scanned by an older model. */
async function rescanBatch(limit = 200) {
  const currentVersion = process.env.CURRENT_MODEL_VERSION; // optional
  const query = { $or: [{ scanStatus: 'unscanned' }, ...(currentVersion ? [{ modelVersion: { $ne: currentVersion } }] : [])] };
  const docs = await Url.find(query).limit(limit);
  let updated = 0;
  for (const doc of docs) {
    const scan = await classifyUrl(doc.originalUrl);
    if (scan.scanStatus !== 'scanned') continue;
    Object.assign(doc, scan);
    await doc.save();
    await cache.del(doc.shortCode); // drop stale cached verdict
    updated++;
  }
  console.log(`[rescanner] checked ${docs.length}, updated ${updated}`);
}

function startRescanner() {
  cron.schedule(env.RESCAN_CRON, () => rescanBatch().catch((e) => console.error('[rescanner]', e.message)));
  console.log(`[rescanner] scheduled: ${env.RESCAN_CRON}`);
}

module.exports = { startRescanner, rescanBatch };
