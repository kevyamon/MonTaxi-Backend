const express = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
  updatePushTokenSchema
} = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);
router.put('/password', requireAuth, validateRequest(updatePasswordSchema), authController.updatePassword);
router.put('/push-token', requireAuth, validateRequest(updatePushTokenSchema), authController.updatePushToken);

module.exports = router;
