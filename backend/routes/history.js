const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's report history
// @route   GET /api/history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const Report = require('../models/Report');
    const reports = await Report.find({ userId: req.user.id })
      .sort({ uploadDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
