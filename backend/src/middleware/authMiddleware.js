const jwt = require('jsonwebtoken');
const env = require('../config/env');

function readToken(req) {
  const h = req.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attaches req.user if a valid token is present, otherwise continues anonymously.
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try { req.user = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }); } catch { /* anonymous */ }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
