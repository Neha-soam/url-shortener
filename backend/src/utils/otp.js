const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// 6-digit numeric code. crypto.randomInt is uniform & unpredictable (unlike Math.random).
function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// Store only a hash, same reasoning as passwords: a DB leak shouldn't hand
// out valid codes. Cost 10 is enough for a 6-digit code that also expires
// and is rate-limited -- no need for the full 12 rounds used on passwords.
const hashOtp = (code) => bcrypt.hash(code, 10);
const verifyOtp = (code, hash) => bcrypt.compare(code, hash);

module.exports = { generateOtp, hashOtp, verifyOtp };
