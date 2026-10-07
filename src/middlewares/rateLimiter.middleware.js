const rateLimit = require('express-rate-limit');
const HTTP_STATUS = require('../constants/httpStatus.constants');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer plus tard.'
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 tentatives de connexion / inscription
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives d’authentification. Veuillez patienter 15 minutes avant de réessayer.'
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
});

module.exports = {
  apiLimiter,
  authLimiter
};
