// Analytics is exposed as GET /api/urls/:id/analytics (see urlRoutes.js).
// This router is reserved for future aggregate endpoints, e.g. GET /api/analytics/summary.
const router = require('express').Router();
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/summary', requireAuth, (req, res) => res.status(501).json({ error: 'Not implemented yet' }));

module.exports = router;
