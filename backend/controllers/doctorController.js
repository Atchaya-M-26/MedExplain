const User = require('../models/User');
const ExtractedData = require('../models/ExtractedData');
const Report = require('../models/Report');

const getPatient = async (req, res) => {
  try {
    const patient = await User.findOne({ patientId: req.params.patientId });

    if (!patient) {
      return res.status(404).json({ error: 'Patient record not found' });
    }

    const [timeline, reports] = await Promise.all([
      ExtractedData.find({ userId: patient._id })
        .sort({ visitDate: -1 })
        .select('_id reportId condition medications summary visitDate createdAt insights testResults dosage clinicalAnalysis'),
      Report.find({ userId: patient._id }).select('fileName originalName fileType uploadDate status')
    ]);

    res.json({
      success: true,
      data: {
        name: patient.name,
        email: patient.email,
        patientId: patient.patientId,
        userId: patient._id,
        timeline,
        reports
      }
    });
  } catch (err) {
    console.error('getPatient error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPatient };
