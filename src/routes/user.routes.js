const express = require('express');
const userController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { updateProfileSchema } = require('../validations/auth.validation');

const router = express.Router();

router.use(requireAuth);

router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.delete('/account', userController.deleteAccount);

router.get('/notifications', userController.getNotifications);
router.patch('/notifications/read-all', userController.markAllNotificationsAsRead);
router.patch('/notifications/:id/archive', userController.archiveNotification);
router.delete('/notifications/:id', userController.deleteNotification);

module.exports = router;
