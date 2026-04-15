const express = require('express');
const { register, login, getMe, updateLanguage, googleAuth, sendAnnouncement } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguage);
router.post('/send-announcement', protect, sendAnnouncement);

module.exports = router;
