const express = require('express');
const { sendMessage, getChatHistory } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/history/:reportId', protect, getChatHistory);

module.exports = router;
