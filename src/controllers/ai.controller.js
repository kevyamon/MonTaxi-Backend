const geminiService = require('../services/ai/gemini.service');
const HTTP_STATUS = require('../constants/httpStatus.constants');

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!message || typeof message !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Le message est obligatoire et doit être une chaîne de caractères.'
      });
    }

    const result = await geminiService.processUserMessage(userId, message);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        reply: result.reply,
        messages: result.messages
      }
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const messages = await geminiService.getConversationHistory(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    await geminiService.clearConversationHistory(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Historique de discussion réinitialisé avec succès.',
      data: {
        messages: []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory
};
