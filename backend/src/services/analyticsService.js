const mongoose = require('mongoose');
const Click = require('../models/Click');
const Url = require('../models/Url');

function parseUserAgent(ua = '') {
  const s = ua.toLowerCase();
  let deviceType = 'desktop';
  if (!s) deviceType = 'unknown';
  else if (/bot|crawl|spider|slurp|preview/.test(s)) deviceType = 'bot';
  else if (/ipad|tablet/.test(s)) deviceType = 'tablet';
  else if (/mobi|android|iphone/.test(s)) deviceType = 'mobile';

  let browser = 'other';
  if (/edg\//.test(s)) browser = 'Edge';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/chrome|crios/.test(s)) browser = 'Chrome';
  else if (/firefox|fxios/.test(s)) browser = 'Firefox';
  else if (/safari/.test(s)) browser = 'Safari';
  else if (!s) browser = 'unknown';
  return { deviceType, browser };
}

function referrerHost(ref) {
  if (!ref) return 'direct';
  try { return new URL(ref).hostname; } catch { return 'unknown'; }
}

/** Fire-and-forget: never delay or break the redirect. Stores NO IP address. */
function recordClick(urlId, req) {
  const { deviceType, browser } = parseUserAgent(req.get('user-agent'));
  Promise.all([
    Click.create({ urlId, referrer: referrerHost(req.get('referer')), deviceType, browser }),
    Url.updateOne({ _id: urlId }, { $inc: { clicks: 1 } }),
  ]).catch((e) => console.error('[analytics] failed to record click:', e.message));
}

async function getAnalytics(urlId, days = 30) {
  const since = new Date(Date.now() - days * 86400 * 1000);
  const match = { urlId: new mongoose.Types.ObjectId(urlId), timestamp: { $gte: since } };
  const group = (field) => [{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }];

  const [res] = await Click.aggregate([
    { $match: match },
    {
      $facet: {
        total: [{ $count: 'n' }],
        overTime: [
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        referrers: group('referrer'),
        devices: group('deviceType'),
        browsers: group('browser'),
      },
    },
  ]);
  const fmt = (arr) => arr.map((x) => ({ label: x._id, count: x.count }));
  return {
    rangeDays: days,
    totalClicks: res.total[0]?.n || 0,
    clicksOverTime: res.overTime.map((x) => ({ date: x._id, count: x.count })),
    referrers: fmt(res.referrers),
    devices: fmt(res.devices),
    browsers: fmt(res.browsers),
  };
}

module.exports = { recordClick, getAnalytics, parseUserAgent };
