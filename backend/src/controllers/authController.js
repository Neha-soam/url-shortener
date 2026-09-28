const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const sign = (user) =>
  jwt.sign({ id: String(user._id), email: user.email }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN });

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ token: sign(user), user: { id: user._id, email: user.email } });
  } catch (e) {
    if (e.code === 11000) return next(new AppError(409, 'Email already registered'));
    next(e);
  }
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
