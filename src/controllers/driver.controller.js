const Driver = require('../models/Driver.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');
const { checkLocationCoverage } = require('../constants/zones.constants');

const updateOnlineStatus = async (req, res, next) => {
  try {
    const { isOnline, latitude, longitude } = req.body;

    // Si le chauffeur tente de passer en ligne, on vérifie impérativement sa localisation
    if (isOnline) {
      let checkLat = latitude;
      let checkLon = longitude;

      // Si les coordonnées ne sont pas fournies dans la requête, on vérifie celles enregistrées
      if (checkLat === undefined || checkLon === undefined) {
        const existingDriver = await Driver.findOne({ user: req.user.userId });
        if (existingDriver?.currentLocation?.coordinates?.length === 2) {
          checkLon = existingDriver.currentLocation.coordinates[0];
          checkLat = existingDriver.currentLocation.coordinates[1];
        }
      }

      const coverage = checkLocationCoverage(checkLat, checkLon);
      if (!coverage.isInCoverage) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message:
            'Impossible de passer en ligne : vous devez être situé dans l’une des zones d’activité de MonTaxi (Bonoua, Aboisso, Adiaké).'
        });
      }
    }

    const updateData = { isOnline };
    if (latitude !== undefined && longitude !== undefined) {
      updateData.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.userId },
      updateData,
      { new: true }
    );

    if (!driver) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Profil chauffeur introuvable.'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: isOnline ? 'Vous êtes désormais en ligne.' : 'Vous êtes passé hors ligne.',
      data: {
        isOnline: driver.isOnline,
        currentLocation: driver.currentLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, heading } = req.body;

    const coverage = checkLocationCoverage(latitude, longitude);
    const updateData = {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      heading: heading || 0
    };

    // Si le chauffeur sort de la zone desservie alors qu'il est en ligne, on le bascule automatiquement hors ligne
    if (!coverage.isInCoverage) {
      updateData.isOnline = false;
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.userId },
      updateData,
      { new: true }
    );

    if (!driver) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Profil chauffeur introuvable.'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        currentLocation: driver.currentLocation,
        heading: driver.heading,
        isOnline: driver.isOnline,
        isInCoverage: coverage.isInCoverage,
        currentZone: coverage.currentZone
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateOnlineStatus,
  updateLocation
};
