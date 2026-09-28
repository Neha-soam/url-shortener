const env = require('../config/env');
const urlService = require('../services/urlService');
const analyticsService = require('../services/analyticsService');
const escapeHtml = require('../utils/escapeHtml');

const present = (doc) => ({
  id: doc._id,
  shortCode: doc.shortCode,
  shortUrl: `${env.BASE_URL}/${doc.shortCode}`,
  originalUrl: doc.originalUrl,
  classification: {
    scanStatus: doc.scanStatus,
    isMalicious: doc.isMalicious,
    riskScore: doc.riskScore,
    modelVersion: doc.modelVersion,
    explanation: doc.explanation,
  },
  clicks: doc.clicks,
  expiresAt: doc.expiresAt,
  createdAt: doc.createdAt,
});

exports.create = async (req, res, next) => {
  try {
    const { url, customAlias, expiresInDays } = req.body;
    const doc = await urlService.createShortUrl({ originalUrl: url, customAlias, expiresInDays, ownerId: req.user?.id });
    res.status(201).json(present(doc));
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    res.json((await urlService.listByOwner(req.user.id)).map(present));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await urlService.deleteUrl(req.params.id, req.user.id);
    res.status(204).end();
  } catch (e) { next(e); }
};

// GET /:shortCode  (hot path)
exports.redirect = async (req, res, next) => {
  try {
    const target = await urlService.resolve(req.params.shortCode);
    if (!target) return res.status(404).send('Link not found or expired.');

    if (target.isMalicious) {
      // Uses the STORED classification; the model is not invoked here.
      return res.status(403).type('html').send(
        `<h1>&#9888; Warning: this link was flagged as potentially malicious</h1>
         <p>Destination (not clickable): <code>${escapeHtml(target.url)}</code></p>
         <p>We blocked the redirect to protect you.</p>`
      );
    }
    analyticsService.recordClick(target.id, req); // async, not awaited
    // 302 (not 301) so browsers don't cache it: keeps click counting + expiry accurate
    res.redirect(302, target.url);
  } catch (e) { next(e); }
};
