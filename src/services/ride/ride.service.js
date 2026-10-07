const Ride = require('../../models/Ride.model');
const Driver = require('../../models/Driver.model');
const { RIDE_STATUS } = require('../../constants/ride.constants');
const { calculateDistanceKm, estimateDurationMin, calculateFare } = require('../geo/geo.service');
const { dispatchRide } = require('../dispatch/dispatch.service');
const { notifyUser } = require('../notification/notification.service');
const { getIO } = require('../../sockets/socket.server');

const createRide = async (passengerId, data) => {
  const { pickupLocation, dropoffLocation, tier, paymentMethod } = data;

  const distanceKm = calculateDistanceKm(
    pickupLocation.coordinates,
    dropoffLocation.coordinates
  );
  const durationMin = estimateDurationMin(distanceKm);
  const calculatedFare = calculateFare(distanceKm, durationMin, tier);

  const ride = await Ride.create({
    passenger: passengerId,
    tier,
    pickupLocation,
    dropoffLocation,
    fare: calculatedFare,
    paymentMethod: paymentMethod || 'cash',
    status: RIDE_STATUS.SEARCHING
  });

  // Déclenchement asynchrone du dispatch
  setImmediate(() => {
    dispatchRide(ride._id);
  });

  return ride;
};

const acceptRide = async (driverUserId, rideId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    const error = new Error('Course introuvable.');
    error.statusCode = 404;
    throw error;
  }

  if (ride.status !== RIDE_STATUS.SEARCHING) {
    const error = new Error('Cette course a déjà été prise ou n’est plus disponible.');
    error.statusCode = 400;
    throw error;
  }

  const driver = await Driver.findOne({ user: driverUserId });
  if (!driver || !driver.isOnline || driver.isBusy) {
    const error = new Error('Vous n’êtes pas éligible pour accepter cette course.');
    error.statusCode = 400;
    throw error;
  }

  ride.driver = driverUserId;
  ride.status = RIDE_STATUS.ACCEPTED;
  ride.acceptedAt = new Date();
  await ride.save();

  driver.isBusy = true;
  await driver.save();

  const populatedRide = await Ride.findById(ride._id)
    .populate('passenger', 'fullName phone avatarUrl')
    .populate('driver', 'fullName phone avatarUrl');

  const io = getIO();
  io.to(`user:${ride.passenger}`).emit('ride:accepted', {
    ride: populatedRide,
    driverLocation: driver.currentLocation.coordinates
  });

  await notifyUser({
    userId: ride.passenger,
    title: 'Chauffeur trouvé !',
    message: `Votre chauffeur est en route pour venir vous chercher.`,
    type: 'ride_update',
    data: { rideId: ride._id }
  });

  return populatedRide;
};

const notifyDriverArrived = async (driverUserId, rideId) => {
  const ride = await Ride.findOne({ _id: rideId, driver: driverUserId });
  if (!ride) {
    const error = new Error('Course introuvable.');
    error.statusCode = 404;
    throw error;
  }

  ride.status = RIDE_STATUS.DRIVER_ARRIVING;
  ride.driverArrivedAt = new Date();
  await ride.save();

  const io = getIO();
  io.to(`user:${ride.passenger}`).emit('ride:driver_arrived', { rideId: ride._id });

  await notifyUser({
    userId: ride.passenger,
    title: 'Chauffeur arrivé !',
    message: 'Votre taxi est sur place. Veuillez monter à bord.',
    type: 'ride_update',
    data: { rideId: ride._id }
  });

  return ride;
};

const startRide = async (driverUserId, rideId) => {
  const ride = await Ride.findOne({ _id: rideId, driver: driverUserId });
  if (!ride) {
    const error = new Error('Course introuvable.');
    error.statusCode = 404;
    throw error;
  }

  ride.status = RIDE_STATUS.IN_PROGRESS;
  ride.startedAt = new Date();
  await ride.save();

  const io = getIO();
  io.to(`user:${ride.passenger}`).emit('ride:started', { rideId: ride._id });

  await notifyUser({
    userId: ride.passenger,
    title: 'Course en cours',
    message: 'Bonne route avec MonTaxi ! Destination en cours d’acheminement.',
    type: 'ride_update',
    data: { rideId: ride._id }
  });

  return ride;
};

const completeRide = async (driverUserId, rideId) => {
  const ride = await Ride.findOne({ _id: rideId, driver: driverUserId });
  if (!ride) {
    const error = new Error('Course introuvable.');
    error.statusCode = 404;
    throw error;
  }

  ride.status = RIDE_STATUS.COMPLETED;
  ride.completedAt = new Date();
  ride.isPaid = true;
  await ride.save();

  await Driver.findOneAndUpdate(
    { user: driverUserId },
    { isBusy: false, $inc: { totalRides: 1 } }
  );

  const io = getIO();
  io.to(`user:${ride.passenger}`).emit('ride:completed', {
    rideId: ride._id,
    fare: ride.fare
  });

  await notifyUser({
    userId: ride.passenger,
    title: 'Destination atteinte !',
    message: `Merci d’avoir utilisé MonTaxi. Montant à régler : ${ride.fare.totalPrice} FCFA.`,
    type: 'ride_update',
    data: { rideId: ride._id, fare: ride.fare }
  });

  return ride;
};

const cancelRide = async (userId, rideId, reason = 'Annulé') => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    const error = new Error('Course introuvable.');
    error.statusCode = 404;
    throw error;
  }

  if ([RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED].includes(ride.status)) {
    const error = new Error('Cette course ne peut plus être annulée.');
    error.statusCode = 400;
    throw error;
  }

  const isPassenger = ride.passenger.toString() === userId.toString();
  const isDriver = ride.driver && ride.driver.toString() === userId.toString();

  ride.status = RIDE_STATUS.CANCELLED;
  ride.cancelledBy = isPassenger ? 'passenger' : isDriver ? 'driver' : 'system';
  ride.cancelReason = reason;
  ride.cancelledAt = new Date();
  await ride.save();

  if (ride.driver) {
    await Driver.findOneAndUpdate({ user: ride.driver }, { isBusy: false });
  }

  const io = getIO();
  io.to(`ride:${ride._id}`).emit('ride:cancelled', { rideId: ride._id, reason });

  return ride;
};

module.exports = {
  createRide,
  acceptRide,
  notifyDriverArrived,
  startRide,
  completeRide,
  cancelRide
};
