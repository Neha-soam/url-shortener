const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { validate, authSchema, startRegistrationSchema, verifyRegistrationSchema } = require('../middleware/validation');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register/start', otpLimiter, validate(startRegistrationSchema), ctrl.startRegistration);
router.post('/register/verify', authLimiter, validate(verifyRegistrationSchema), ctrl.verifyRegistration);
router.post('/login', authLimiter, validate(authSchema), ctrl.login);

module.exports = router;
