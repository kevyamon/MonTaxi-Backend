const Notification = require('../../models/Notification.model');
const User = require('../../models/User.model');
const { sendExpoPushNotification } = require('./expoPush.service');
const { getIO } = require('../../sockets/socket.server');

const notifyUser = async ({ userId, title, message, type = 'ride_update', data = {} }) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      title,
      message,
      type,
      data
    });

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      isArchived: false
    });

    // Émission temps réel via Socket.io
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', {
        notification,
        unreadCount
      });
    } catch (socketErr) {
      // Ignoré si Socket non connecté
    }

    // Envoi de la notification push native Expo
    const user = await User.findById(userId).select('expoPushToken');
    if (user && user.expoPushToken) {
      await sendExpoPushNotification(user.expoPushToken, title, message, {
        notificationId: notification._id,
        unreadCount,
        ...data
      });
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService] Erreur création notification :', error.message);
    return null;
  }
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false
  });
};

module.exports = {
  notifyUser,
  getUnreadCount
};
