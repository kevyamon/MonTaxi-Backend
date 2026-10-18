const express = require('express');
const aiController = require('../controllers/ai.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/chat', aiController.sendMessage);
router.get('/history', aiController.getHistory);
router.delete('/history', aiController.clearHistory);

module.exports = router;
