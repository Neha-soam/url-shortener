const mongoose = require('mongoose');
const env = require('../config/env');

// Privacy by design: NO IP address, NO full user-agent, NO full referrer URL.
const clickSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: 'direct' }, // hostname only
  deviceType: { type: String, default: 'unknown' }, // mobile | tablet | desktop | bot | unknown
  browser: { type: String, default: 'unknown' },
});

// Retention policy enforced by the DB
clickSchema.index({ timestamp: 1 }, { expireAfterSeconds: env.CLICK_RETENTION_DAYS * 86400 });

module.exports = mongoose.model('Click', clickSchema);
