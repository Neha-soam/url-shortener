const mongoose = require('mongoose');

// A user is NOT created until the OTP is verified -- this collection holds
// the half-finished signup in the meantime. TTL index auto-deletes it once
// expired, so an abandoned signup doesn't block that email address forever.
const pendingRegistrationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now }, // for the resend cooldown
  expiresAt: { type: Date, required: true },
});

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
