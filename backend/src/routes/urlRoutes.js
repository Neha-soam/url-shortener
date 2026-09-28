const router = require('express').Router();
const ctrl = require('../controllers/urlController');
const analytics = require('../controllers/analyticsController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { validate, createUrlSchema } = require('../middleware/validation');
const { createLimiter } = require('../middleware/rateLimiter');

// order: rate limit -> auth -> validate -> controller
router.post('/', createLimiter, optionalAuth, validate(createUrlSchema), ctrl.create);
router.get('/', requireAuth, ctrl.listMine);
router.delete('/:id', requireAuth, ctrl.remove);
router.get('/:id/analytics', requireAuth, analytics.get);

module.exports = router;
