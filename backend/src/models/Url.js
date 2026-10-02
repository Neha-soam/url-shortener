const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    // unique:true creates the unique index -> the DB (not app code) enforces uniqueness
    shortCode: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    // ML result stored once at creation (never re-run on redirect)
    isMalicious: { type: Boolean, default: false },
    riskScore: { type: Number, default: null },
    scanStatus: { type: String, enum: ['scanned', 'unscanned'], default: 'unscanned' },
    modelVersion: { type: String, default: null },
    explanation: { type: [String], default: [] },

    // Live "does the destination actually respond" check -- separate from
    // the ML phishing classification above. See securityService.checkReachability.
    reachability: {
      status: { type: String, enum: ['reachable', 'unknown'], default: 'unknown' },
      httpStatus: { type: Number, default: null },
      checkedAt: { type: Date, default: null },
    },

    expiresAt: { type: Date, default: null },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL index: MongoDB removes docs shortly after expiresAt (runs ~every 60s).
// Redirect code STILL checks expiresAt itself, because deletion is not instant.
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);
