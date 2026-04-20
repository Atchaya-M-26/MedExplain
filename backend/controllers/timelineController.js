const ExtractedData = require('../models/ExtractedData');

const getTimeline = async (req, res) => {
  try {
    const entries = await ExtractedData.find({ userId: req.user.id })
      .sort({ visitDate: -1 })
      .select('_id reportId condition medications summary visitDate createdAt insights testResults dosage clinicalAnalysis');

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timeline' });
  }
};

module.exports = { getTimeline };
