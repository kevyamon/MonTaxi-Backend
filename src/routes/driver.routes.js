const express = require('express');
const driverController = require('../controllers/driver.controller');
const validateRequest = require('../middlewares/validate.middleware');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants/roles.constants');
const { updateStatusSchema, updateLocationSchema } = require('../validations/driver.validation');

const router = express.Router();

router.use(requireAuth, requireRole(ROLES.DRIVER));

router.patch('/status', validateRequest(updateStatusSchema), driverController.updateOnlineStatus);
router.patch('/location', validateRequest(updateLocationSchema), driverController.updateLocation);

module.exports = router;
