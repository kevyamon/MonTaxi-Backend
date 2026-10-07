const { Expo } = require('expo-server-sdk');
const envConfig = require('../../config/env.config');

const expo = new Expo({
  accessToken: envConfig.expo.accessToken || undefined
});

const sendExpoPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    console.warn(`[ExpoPush] Jeton Expo Push invalide ou manquant : ${pushToken}`);
    return null;
  }

  const messages = [
    {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'montaxi-rides'
    }
  ];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return tickets;
  } catch (error) {
    console.error('[ExpoPush] Erreur lors de l’envoi de la notification push :', error.message);
    return null;
  }
};

module.exports = {
  sendExpoPushNotification
};
