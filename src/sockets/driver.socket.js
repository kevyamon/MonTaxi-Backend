const registerDriverHandlers = (io, socket) => {
  // Mise à jour de la position GPS en direct du chauffeur
  socket.on('driver:location:update', async (data) => {
    try {
      const { latitude, longitude, heading } = data;
      if (!latitude || !longitude) return;

      const driverId = socket.user?.userId;
      if (!driverId) return;

      // Diffuse aux passagers ayant une course active avec ce chauffeur
      if (data.rideId) {
        io.to(`ride:${data.rideId}`).emit('driver:location:changed', {
          driverId,
          latitude,
          longitude,
          heading: heading || 0,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('[Socket] Erreur mise à jour position chauffeur :', error.message);
    }
  });
};

module.exports = registerDriverHandlers;
