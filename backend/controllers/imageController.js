const ImageAnalysis = require('../models/ImageAnalysis');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

// Upload and analyze chest X-ray
exports.analyzeChestXray = async (req, res) => {
  try {
    console.log('🔍 analyzeChestXray called');
    console.log('User ID:', req.user.id);
    console.log('File info:', req.file ? { name: req.file.filename, path: req.file.path, size: req.file.size } : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Send image to ML server
    const formData = new FormData();
    const fileStream = fs.createReadStream(req.file.path);
    formData.append('file', fileStream);

    console.log('📤 Sending to ML server:', `${ML_API_URL}/analyze/chest-xray`);
    const mlResponse = await axios.post(`${ML_API_URL}/analyze/chest-xray`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000
    });

    console.log('✅ ML response received:', mlResponse.data);

    // Save analysis to database
    const imageAnalysis = new ImageAnalysis({
      userId: req.user.id,
      imageType: 'chest-xray',
      fileName: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      prediction: mlResponse.data.prediction,
      confidence: mlResponse.data.confidence,
      riskLevel: mlResponse.data.risk_level,
      findings: mlResponse.data.findings,
      recommendation: mlResponse.data.recommendation,
      chestXrayData: {
        normalProbability: mlResponse.data.normal_probability,
        abnormalProbability: mlResponse.data.abnormal_probability,
        interpretation: mlResponse.data.interpretation
      }
    });

    await imageAnalysis.save();

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(201).json({
      message: 'Chest X-ray analysis completed',
      analysis: imageAnalysis
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    console.error('Chest X-ray analysis error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      message: 'Error analyzing chest X-ray',
      error: error.message,
      details: error.response?.data || 'No response from ML server'
    });
  }
};

// Upload and analyze CT scan
exports.analyzeCTScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Send image to ML server
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const mlResponse = await axios.post(`${ML_API_URL}/analyze/ct-scan`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000
    });

    // Save analysis to database
    const imageAnalysis = new ImageAnalysis({
      userId: req.user.id,
      imageType: 'ct-scan',
      fileName: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      prediction: mlResponse.data.prediction,
      confidence: mlResponse.data.confidence,
      riskLevel: mlResponse.data.risk_level,
      findings: mlResponse.data.findings,
      recommendation: mlResponse.data.recommendation,
      ctScanData: {
        probabilities: mlResponse.data.probabilities
      }
    });

    await imageAnalysis.save();

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(201).json({
      message: 'CT scan analysis completed',
      analysis: imageAnalysis
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    console.error('CT scan analysis error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      message: 'Error analyzing CT scan',
      error: error.message,
      details: error.response?.data || 'No response from ML server'
    });
  }
};

// Upload and analyze MRI
exports.analyzeMRI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Send image to ML server
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const mlResponse = await axios.post(`${ML_API_URL}/analyze/mri`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000
    });

    // Save analysis to database
    const imageAnalysis = new ImageAnalysis({
      userId: req.user.id,
      imageType: 'mri',
      fileName: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      prediction: mlResponse.data.prediction,
      confidence: mlResponse.data.confidence,
      riskLevel: mlResponse.data.risk_level,
      findings: mlResponse.data.findings,
      recommendation: mlResponse.data.recommendation,
      mriData: {
        normalProbability: mlResponse.data.normal_probability,
        abnormalProbability: mlResponse.data.abnormal_probability
      }
    });

    await imageAnalysis.save();

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(201).json({
      message: 'MRI analysis completed',
      analysis: imageAnalysis
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    console.error('MRI analysis error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      message: 'Error analyzing MRI',
      error: error.message,
      details: error.response?.data || 'No response from ML server'
    });
  }
};

// Get user's image analysis history (excluding deleted)
exports.getUserAnalysisHistory = async (req, res) => {
  try {
    const analyses = await ImageAnalysis.find({ userId: req.user.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .select('-imageUrl'); // Don't send image URLs to frontend

    res.json({
      message: 'User analysis history retrieved',
      count: analyses.length,
      analyses
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error.message);
    res.status(500).json({
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
};

// Get specific analysis by ID
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await ImageAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check authorization (user can only view their own analysis, or doctor assigned to them)
    if (analysis.userId.toString() !== req.user.id.toString() && 
        analysis.doctorId?.toString() !== req.user.id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this analysis' });
    }

    res.json({
      message: 'Analysis retrieved',
      analysis
    });
  } catch (error) {
    console.error('Error fetching analysis:', error.message);
    res.status(500).json({
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};

// Delete analysis (soft delete)
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await ImageAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check authorization
    if (analysis.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this analysis' });
    }

    // Soft delete - mark as deleted instead of removing
    analysis.isDeleted = true;
    analysis.deletedAt = new Date();
    await analysis.save();

    res.json({
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analysis:', error.message);
    res.status(500).json({
      message: 'Error deleting analysis',
      error: error.message
    });
  }
};

// Get deleted analysis history
exports.getDeletedAnalysisHistory = async (req, res) => {
  try {
    const deletedAnalyses = await ImageAnalysis.find({ userId: req.user.id, isDeleted: true })
      .sort({ deletedAt: -1 })
      .select('-imageUrl');

    res.json({
      message: 'Deleted analysis history retrieved',
      count: deletedAnalyses.length,
      analyses: deletedAnalyses
    });
  } catch (error) {
    console.error('Error fetching deleted analysis history:', error.message);
    res.status(500).json({
      message: 'Error fetching deleted analysis history',
      error: error.message
    });
  }
};

// Restore deleted analysis
exports.restoreAnalysis = async (req, res) => {
  try {
    const analysis = await ImageAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check authorization
    if (analysis.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to restore this analysis' });
    }

    // Check if deleted
    if (!analysis.isDeleted) {
      return res.status(400).json({ message: 'Analysis is not deleted' });
    }

    // Restore
    analysis.isDeleted = false;
    analysis.deletedAt = null;
    await analysis.save();

    res.json({
      message: 'Analysis restored successfully',
      analysis
    });
  } catch (error) {
    console.error('Error restoring analysis:', error.message);
    res.status(500).json({
      message: 'Error restoring analysis',
      error: error.message
    });
  }
};

// Permanently delete analysis (hard delete)
exports.permanentlyDeleteAnalysis = async (req, res) => {
  try {
    const analysis = await ImageAnalysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check authorization
    if (analysis.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this analysis' });
    }

    // Delete the uploaded image file if it exists
    if (analysis.imageUrl) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', analysis.imageUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Permanently remove from database
    await ImageAnalysis.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Analysis permanently deleted successfully'
    });
  } catch (error) {
    console.error('Error permanently deleting analysis:', error.message);
    res.status(500).json({
      message: 'Error permanently deleting analysis',
      error: error.message
    });
  }
};

// Get analyses for doctor's patients
exports.getDoctorAnalyses = async (req, res) => {
  try {
    // Get all patients assigned to this doctor
    const patients = await User.find({
      assignedDoctor: req.user.id,
      role: 'patient'
    }).select('_id');

    const patientIds = patients.map(p => p._id);

    // Get all analyses for these patients
    const analyses = await ImageAnalysis.find({ userId: { $in: patientIds } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Doctor analyses retrieved',
      count: analyses.length,
      analyses
    });
  } catch (error) {
    console.error('Error fetching doctor analyses:', error.message);
    res.status(500).json({
      message: 'Error fetching doctor analyses',
      error: error.message
    });
  }
};

// Add doctor notes to analysis
exports.addDoctorNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ message: 'Notes cannot be empty' });
    }

    const analysis = await ImageAnalysis.findByIdAndUpdate(
      req.params.id,
      {
        doctorNotes: notes,
        doctorId: req.user.id,
        status: 'reviewed'
      },
      { new: true }
    );

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json({
      message: 'Doctor notes added',
      analysis
    });
  } catch (error) {
    console.error('Error adding doctor notes:', error.message);
    res.status(500).json({
      message: 'Error adding doctor notes',
      error: error.message
    });
  }
};
