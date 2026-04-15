const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTimeline } = require('../controllers/timelineController');

router.get('/', protect, getTimeline);

module.exports = router;
