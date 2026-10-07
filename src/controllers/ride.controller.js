const rideService = require('../services/ride/ride.service');
const Ride = require('../models/Ride.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');

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

module.exports = {
  requestRide,
  acceptRide,
  notifyArrived,
  startRide,
  completeRide,
  cancelRide,
  getRideDetails,
  getRideHistory
};
