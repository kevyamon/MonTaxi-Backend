const registerRideHandlers = (io, socket) => {
  // Rejoint la salle spécifique d'une course pour écouter ses événements
  socket.on('ride:join', (data) => {
    const { rideId } = data || {};
    if (rideId) {
      socket.join(`ride:${rideId}`);
    }
  });

  // Quitte la salle d'une course
  socket.on('ride:leave', (data) => {
    const { rideId } = data || {};
    if (rideId) {
      socket.leave(`ride:${rideId}`);
    }
  });
};

module.exports = registerRideHandlers;
