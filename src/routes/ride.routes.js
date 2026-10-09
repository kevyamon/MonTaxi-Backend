const express = require('express');
const rideController = require('../controllers/ride.controller');
const validateRequest = require('../middlewares/validate.middleware');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants/roles.constants');
const { createRideSchema, cancelRideSchema } = require('../validations/ride.validation');

const router = express.Router();

router.use(requireAuth);

router.post('/estimate', rideController.estimateRide);
router.post('/', validateRequest(createRideSchema), rideController.requestRide);
router.get('/history', rideController.getRideHistory);
router.get('/:id', rideController.getRideDetails);
router.patch('/:id/cancel', validateRequest(cancelRideSchema), rideController.cancelRide);
router.patch('/:id/archive', rideController.archiveRide);
router.patch('/:id/unarchive', rideController.unarchiveRide);
router.delete('/:id', rideController.deleteRide);

// Routes réservées aux chauffeurs
router.patch('/:id/accept', requireRole(ROLES.DRIVER), rideController.acceptRide);
router.patch('/:id/arrived', requireRole(ROLES.DRIVER), rideController.notifyArrived);
router.patch('/:id/start', requireRole(ROLES.DRIVER), rideController.startRide);
router.patch('/:id/complete', requireRole(ROLES.DRIVER), rideController.completeRide);

module.exports = router;
