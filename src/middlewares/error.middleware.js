const HTTP_STATUS = require('../constants/httpStatus.constants');
const envConfig = require('../config/env.config');

const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Ressource introuvable : ${req.method} ${req.originalUrl}`
  });
};

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Une erreur interne est survenue sur le serveur';
  let errors = null;

  if (err.name === 'ZodError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = err.errors?.[0]?.message || 'Données de requête invalides';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
  } else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Ce ${duplicatedField} est déjà utilisé par un autre compte`;
  } else if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Identifiant invalide : ${err.value}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Jeton de session invalide';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Votre session a expiré, veuillez vous reconnecter';
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(!envConfig.isProduction && { stack: err.stack })
  };

  if (statusCode >= 500) {
    console.error('[SERVER_ERROR]', err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
