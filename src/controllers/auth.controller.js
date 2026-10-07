const authService = require('../services/auth/auth.service');
const User = require('../models/User.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Inscription réussie avec succès.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Connexion réussie.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const tokens = await authService.refreshSession(req.body.refreshToken);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Session renouvelée avec succès.',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const updatePushToken = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      expoPushToken: req.body.expoPushToken
    });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Jeton de notification push enregistré avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  updatePassword,
  updatePushToken
};
