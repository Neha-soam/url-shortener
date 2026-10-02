const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../services/emailService');

const sign = (user) =>
  jwt.sign({ id: String(user._id), email: user.email }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN });

// Step 1: POST /api/auth/register/start { email, password }
// Does NOT create a User yet -- only once the OTP is verified (step 2) does
// a real account exist. Safe to call again for the same email to resend
// (subject to a cooldown), since nothing durable has been created yet.
exports.startRegistration = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) throw new AppError(409, 'Email already registered');

    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (pending) {
      const secondsSinceLastSend = (Date.now() - pending.lastSentAt.getTime()) / 1000;
      if (secondsSinceLastSend < env.OTP_RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(env.OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
        throw new AppError(429, `Please wait ${wait}s before requesting another code`);
      }
    }

    const code = generateOtp();
    const [passwordHash, otpHash] = await Promise.all([bcrypt.hash(password, 12), hashOtp(code)]);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    // upsert: overwrites any previous (expired or not) pending attempt for this email
    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, passwordHash, otpHash, attempts: 0, lastSentAt: new Date(), expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Email sending is awaited deliberately: if it fails, the person needs to
    // know NOW (so they can retry) rather than being told "check your email"
    // for a code that never arrived.
    await sendOtpEmail(normalizedEmail, code);

    res.status(202).json({ message: 'Verification code sent', expiresInMinutes: env.OTP_EXPIRY_MINUTES });
  } catch (e) { next(e); }
};

// Step 2: POST /api/auth/register/verify { email, otp }
// Creates the real User only here, then logs them in (same response shape as /login).
exports.verifyRegistration = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase();

    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (!pending) throw new AppError(400, 'No pending registration for this email -- please start again');
    if (pending.expiresAt <= new Date()) {
      await pending.deleteOne();
      throw new AppError(400, 'Code expired -- please request a new one');
    }
    if (pending.attempts >= env.OTP_MAX_ATTEMPTS) {
      await pending.deleteOne();
      throw new AppError(429, 'Too many incorrect attempts -- please request a new code');
    }

    const match = await verifyOtp(otp, pending.otpHash);
    if (!match) {
      pending.attempts += 1;
      await pending.save();
      throw new AppError(401, 'Incorrect or expired code');
    }

    let user;
    try {
      user = await User.create({ email: normalizedEmail, passwordHash: pending.passwordHash });
    } catch (e) {
      // Rare race: two verify requests for the same pending registration at once.
      if (e.code === 11000) throw new AppError(409, 'Email already registered');
      throw e;
    }
    await pending.deleteOne();

    res.status(201).json({ token: sign(user), user: { id: user._id, email: user.email } });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new AppError(401, 'Invalid email or password'); // same message for both cases
    res.json({ token: sign(user), user: { id: user._id, email: user.email } });
  } catch (e) { next(e); }
};
