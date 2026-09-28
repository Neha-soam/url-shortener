const Url = require('../models/Url');
const analyticsService = require('../services/analyticsService');
const AppError = require('../utils/AppError');

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) throw new AppError(400, 'Invalid id');
    const url = await Url.findOne({ _id: id, owner: req.user.id }).lean(); // ownership check
    if (!url) throw new AppError(404, 'URL not found');
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
    res.json(await analyticsService.getAnalytics(id, days));
  } catch (e) { next(e); }
};
