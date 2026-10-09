const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { uploadSingleImage, uploadSingleDocument } = require('../middlewares/upload.middleware');
const { ROLES } = require('../constants/roles.constants');

const router = express.Router();

// Toutes les routes de téléversement requièrent une authentification valide
router.use(requireAuth);

// Téléversement d'avatar pour tout utilisateur authentifié
router.post('/avatar', uploadSingleImage, uploadController.uploadAvatar);

// Téléversement de documents légaux réservé aux chauffeurs
router.post(
  '/document',
  requireRole(ROLES.DRIVER),
  uploadSingleDocument,
  uploadController.uploadDriverDocument
);

module.exports = router;
