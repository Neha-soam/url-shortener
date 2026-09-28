const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { validate, authSchema } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(authSchema), ctrl.register);
router.post('/login', authLimiter, validate(authSchema), ctrl.login);

module.exports = router;
