const Driver = require('../models/Driver.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');

const updateOnlineStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.userId },
      { isOnline },
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
      data: { isOnline: driver.isOnline }
    });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, heading } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.userId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        heading: heading || 0
      },
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
        heading: driver.heading
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
