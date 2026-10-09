const rideService = require('../services/ride/ride.service');
const Ride = require('../models/Ride.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');
const { calculateDistanceKm, estimateDurationMin, calculateFare } = require('../services/geo/geo.service');

const estimateRide = async (req, res, next) => {
  try {
    const { pickupCoordinates, dropoffCoordinates, distanceKm: customDist } = req.body;
    let distanceKm = customDist || 2.5;
    if (pickupCoordinates && dropoffCoordinates) {
      distanceKm = calculateDistanceKm(pickupCoordinates, dropoffCoordinates);
    }
    const durationMin = estimateDurationMin(distanceKm);
    const ecoFare = calculateFare(distanceKm, durationMin, 'eco');
    const vipFare = calculateFare(distanceKm, durationMin, 'vip');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        distanceKm,
        durationMin,
        fares: {
          eco: ecoFare.totalPrice,
          vip: vipFare.totalPrice
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const requestRide = async (req, res, next) => {
  try {
    const ride = await rideService.createRide(req.user.userId, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Demande de course initiée.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const acceptRide = async (req, res, next) => {
  try {
    const ride = await rideService.acceptRide(req.user.userId, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course acceptée avec succès.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const notifyArrived = async (req, res, next) => {
  try {
    const ride = await rideService.notifyDriverArrived(req.user.userId, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notification d’arrivée transmise au client.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const startRide = async (req, res, next) => {
  try {
    const ride = await rideService.startRide(req.user.userId, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course démarrée.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const completeRide = async (req, res, next) => {
  try {
    const ride = await rideService.completeRide(req.user.userId, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course terminée et clôturée.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const cancelRide = async (req, res, next) => {
  try {
    const reason = req.body?.reason || 'Annulé par l’utilisateur';
    const ride = await rideService.cancelRide(req.user.userId, req.params.id, reason);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course annulée.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const getRideDetails = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('passenger', 'fullName phone avatarUrl')
      .populate('driver', 'fullName phone avatarUrl')
      .lean();

    if (!ride) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Course introuvable.'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const skip = (page - 1) * limit;

    const isDriver = req.user.role === 'driver';
    const filter = isDriver
      ? { driver: req.user.userId, isArchivedByDriver: false }
      : { passenger: req.user.userId, isArchivedByPassenger: false };

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(isDriver ? 'passenger' : 'driver', 'fullName phone avatarUrl')
        .lean(),
      Ride.countDocuments(filter)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        rides,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteRide = async (req, res, next) => {
  try {
    const isDriver = req.user.role === 'driver';
    const filter = isDriver
      ? { _id: req.params.id, driver: req.user.userId }
      : { _id: req.params.id, passenger: req.user.userId };

    await Ride.findOneAndDelete(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course définitivement supprimée de votre historique.'
    });
  } catch (error) {
    next(error);
  }
};

const archiveRide = async (req, res, next) => {
  try {
    const isDriver = req.user.role === 'driver';
    const filter = isDriver
      ? { _id: req.params.id, driver: req.user.userId }
      : { _id: req.params.id, passenger: req.user.userId };

    const update = isDriver ? { isArchivedByDriver: true } : { isArchivedByPassenger: true };

    await Ride.findOneAndUpdate(filter, update);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Course archivée avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimateRide,
  requestRide,
  acceptRide,
  notifyArrived,
  startRide,
  completeRide,
  cancelRide,
  getRideDetails,
  getRideHistory,
  deleteRide,
  archiveRide
};
