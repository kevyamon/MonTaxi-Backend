const Driver = require('../../models/Driver.model');
const Ride = require('../../models/Ride.model');
const { getIO } = require('../../sockets/socket.server');
const { notifyUser } = require('../notification/notification.service');
const { RIDE_STATUS } = require('../../constants/ride.constants');

const findNearbyDrivers = async (coordinates, maxDistanceMeters = 3000) => {
  const [longitude, latitude] = coordinates;

  const drivers = await Driver.find({
    isOnline: true,
    isBusy: false,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  })
    .populate('user', 'fullName phone rating avatarUrl')
    .lean();

  return drivers;
};

const dispatchRide = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId).populate('passenger', 'fullName phone avatarUrl');
    if (!ride || ride.status !== RIDE_STATUS.SEARCHING) return;

    const io = getIO();
    const pickupCoords = ride.pickupLocation.coordinates;

    // Rayons successifs de recherche
    const searchRadii = [
      { radius: 2500, step: 1, text: 'Recherche d’un chauffeur proche...' },
      { radius: 5000, step: 2, text: 'Approfondissement de la recherche...' },
      { radius: 8000, step: 3, text: 'Élargissement du rayon de recherche...' }
    ];

    let drivers = [];
    for (const phase of searchRadii) {
      // Vérifier si la course n'a pas été annulée entre temps
      const currentRide = await Ride.findById(rideId).select('status');
      if (!currentRide || currentRide.status !== RIDE_STATUS.SEARCHING) return;

      io.to(`user:${ride.passenger._id}`).emit('ride:search:progress', {
        rideId: ride._id,
        step: phase.step,
        message: phase.text
      });

      drivers = await findNearbyDrivers(pickupCoords, phase.radius);
      if (drivers.length > 0) break;

      // Délai de recherche entre les phases (3 secondes)
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (drivers.length === 0) {
      // Aucun chauffeur trouvé à la fin du timeout
      const finalCheck = await Ride.findById(rideId).select('status');
      if (finalCheck && finalCheck.status === RIDE_STATUS.SEARCHING) {
        io.to(`user:${ride.passenger._id}`).emit('ride:search:timeout', {
          rideId: ride._id,
          message: 'Aucun chauffeur disponible pour le moment. Vous pouvez relancer la recherche.'
        });
      }
      return;
    }

    // Diffusion aux chauffeurs ciblés
    for (const driver of drivers) {
      io.to(`user:${driver.user._id}`).emit('ride:request:new', {
        rideId: ride._id,
        passengerName: ride.passenger.fullName,
        pickupAddress: ride.pickupLocation.address,
        dropoffAddress: ride.dropoffLocation.address,
        tier: ride.tier,
        fare: ride.fare,
        distanceKm: ride.fare.distanceKm,
        expiresInSeconds: 20
      });

      // Notification push chauffeur
      await notifyUser({
        userId: driver.user._id,
        title: 'Nouvelle demande de course !',
        message: `Course ${ride.tier.toUpperCase()} : ${ride.pickupLocation.address} -> ${ride.dropoffLocation.address}`,
        type: 'ride_update',
        data: { rideId: ride._id }
      });
    }
  } catch (error) {
    console.error('[DispatchService] Erreur lors du dispatch de course :', error.message);
  }
};

module.exports = {
  findNearbyDrivers,
  dispatchRide
};
