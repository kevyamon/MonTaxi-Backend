const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');
const HTTP_STATUS = require('../constants/httpStatus.constants');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Accès non autorisé. Jeton d’authentification manquant.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Format de jeton invalide.'
      });
    }

    const decoded = jwt.verify(token, envConfig.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Jeton d’authentification invalide.'
    });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Action refusée. Privilèges insuffisants pour cette opération.'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole
};
