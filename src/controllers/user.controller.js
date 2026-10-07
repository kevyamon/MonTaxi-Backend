const User = require('../models/User.model');
const Driver = require('../models/Driver.model');
const Notification = require('../models/Notification.model');
const HTTP_STATUS = require('../constants/httpStatus.constants');
const { getUnreadCount } = require('../services/notification/notification.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user || user.isArchived) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Utilisateur introuvable.'
      });
    }

    let driverInfo = null;
    if (user.role === 'driver') {
      driverInfo = await Driver.findOne({ user: user._id }).lean();
    }

    const unreadNotifications = await getUnreadCount(user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        unreadNotifications,
        driverInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, email, avatarUrl } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (email) updates.email = email.toLowerCase();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true
    }).lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { isArchived: true });
    if (req.user.role === 'driver') {
      await Driver.findOneAndUpdate({ user: req.user.userId }, { isOnline: false });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Votre compte a été supprimé avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user.userId, isArchived: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: req.user.userId, isArchived: false }),
      getUnreadCount(req.user.userId)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { isRead: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues.'
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.userId
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notification supprimée avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getNotifications,
  markAllNotificationsAsRead,
  deleteNotification
};
