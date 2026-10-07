const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');
const registerRideHandlers = require('./ride.socket');
const registerDriverHandlers = require('./driver.socket');

let ioInstance = null;

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: envConfig.clientUrl === '*' ? true : envConfig.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware d'authentification Socket.io
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentification Socket requise : Jeton manquant'));
      }

      const decoded = jwt.verify(token, envConfig.jwt.accessSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentification Socket échouée : Jeton invalide ou expiré'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.userId;
    const role = socket.user?.role;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role === 'driver') {
      socket.join('drivers:online');
    }

    registerRideHandlers(io, socket);
    registerDriverHandlers(io, socket);

    socket.on('disconnect', () => {
      // Nettoyage au besoin
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io n’a pas encore été initialisé !');
  }
  return ioInstance;
};

module.exports = {
  initSocketServer,
  getIO
};
