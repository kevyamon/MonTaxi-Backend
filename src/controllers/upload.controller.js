const uploadService = require('../services/upload/upload.service');
const User = require('../models/User.model');
const Driver = require('../models/Driver.model');

/**
 * Téléverse et met à jour la photo de profil de l'utilisateur connecté
 * POST /api/upload/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un fichier image à téléverser.'
      });
    }

    const userId = req.user._id;
    const result = await uploadService.uploadAvatar(req.file.buffer, userId);

    // Mise à jour de l'avatar dans le document User
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: result.url },
      { new: true }
    ).select('-passwordHash -refreshTokenHash');

    return res.status(200).json({
      success: true,
      message: 'Photo de profil mise à jour avec succès.',
      data: {
        avatarUrl: result.url,
        publicId: result.publicId,
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Téléverse un document officiel de chauffeur (permis, CNI, carte grise)
 * POST /api/upload/document
 */
const uploadDriverDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un document à téléverser.'
      });
    }

    const { docType } = req.body;
    const validDocTypes = ['driverLicense', 'idCard', 'vehicleRegistration'];

    if (!docType || !validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de document invalide. Types acceptés : driverLicense, idCard, vehicleRegistration.'
      });
    }

    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Profil chauffeur introuvable.'
      });
    }

    const result = await uploadService.uploadDriverDocument(
      req.file.buffer,
      driver._id,
      docType
    );

    // Mise à jour du document spécifique
    const docKeyMap = {
      driverLicense: 'documents.driverLicenseUrl',
      idCard: 'documents.idCardUrl',
      vehicleRegistration: 'documents.vehicleRegistrationUrl'
    };

    const updateQuery = {};
    updateQuery[docKeyMap[docType]] = result.url;

    const updatedDriver = await Driver.findByIdAndUpdate(driver._id, updateQuery, {
      new: true
    }).populate('user', 'fullName phone email avatarUrl');

    return res.status(200).json({
      success: true,
      message: 'Document officiel téléversé avec succès.',
      data: {
        docType,
        url: result.url,
        driver: updatedDriver
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAvatar,
  uploadDriverDocument
};
