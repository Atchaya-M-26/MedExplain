const Report = require('../models/Report');
const ExtractedData = require('../models/ExtractedData');
const fs = require('fs');
const path = require('path');
const {
  extractTextFromPDF,
  extractTextFromImage,
  simplifyMedicalText,
  generateSummary,
  identifyAbnormalValues
} = require('../utils/ocrProcessor');
const { parseStructured } = require('../services/structuredExtractor');
const { sendReportNotification } = require('../services/emailService');
const User = require('../models/User');

// @desc    Upload and process report
// @route   POST /api/reports/upload
// @access  Private
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const existing = await Report.findOne({ userId: req.user.id, originalName: req.file.originalname });
    if (existing) {
      return res.status(409).json({ error: 'This report has already been uploaded' });
    }

    const report = await Report.create({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully. Processing...',
      report: report
    });

    // Trigger processing asynchronously
    processReport(report._id);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all reports for a user
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id, isDeleted: { $ne: true } })
      .sort({ uploadDate: -1 });
    
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
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Soft delete - mark as deleted instead of removing
    report.isDeleted = true;
    report.deletedAt = new Date();
    await report.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get deleted reports
// @route   GET /api/reports/deleted/history
// @access  Private
exports.getDeletedReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id, isDeleted: true })
      .sort({ deletedAt: -1 });
    
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
};

// @desc    Restore deleted report
// @route   PATCH /api/reports/:id/restore
// @access  Private
exports.restoreReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Restore by unmarking as deleted
    report.isDeleted = false;
    report.deletedAt = null;
    await report.save();
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Permanently delete report
// @route   DELETE /api/reports/:id/permanent
// @access  Private
exports.permanentlyDeleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete the uploaded file if it exists
    if (report.fileName) {
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../uploads', report.fileName);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    // Hard delete from database
    await Report.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Report permanently deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to process reports
async function processReport(reportId) {
  try {
    const report = await Report.findById(reportId);
    
    if (!report) {
      console.error(`Report ${reportId} not found`);
      return;
    }

    const filePath = path.join(__dirname, '../uploads', report.fileName);
    const fileExtension = path.extname(report.fileName).toLowerCase();

    let extractedText = '';

    // Extract text from file (PDF or Image)
    if (report.fileType === 'pdf' || fileExtension === '.pdf') {
      console.log('Extracting text from PDF...');
      extractedText = await extractTextFromPDF(filePath);
    } else {
      console.log('Extracting text from image using OCR...');
      extractedText = await extractTextFromImage(filePath);
    }

    if (!extractedText.trim()) {
      throw new Error('No text extracted from file');
    }

    console.log('Text extracted successfully, processing...');

    // Simplify medical terminology
    const simplifiedText = simplifyMedicalText(extractedText);

    // Generate summary
    const summary = generateSummary(simplifiedText);

    // Identify abnormal values
    const abnormalValues = identifyAbnormalValues(extractedText);

    // Find important values and create analysis
    const analysis = extractKeyValues(simplifiedText);

    console.log(`Extracted ${analysis.length} parameters from report`);

    // Parse structured data and save ExtractedData document
    const structuredData = await parseStructured(extractedText, report.userId);
    await ExtractedData.findOneAndUpdate(
      { reportId: reportId },
      {
        ...structuredData,
        clinicalAnalysis: structuredData.clinicalAnalysis || null,
        reportId: reportId,
        userId: report.userId,
      },
      { upsert: true, new: true }
    );

    // Update report using findByIdAndUpdate
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        extractedText: extractedText,
        simplifiedSummary: summary,
        abnormalFindings: abnormalValues,
        analysis: analysis,
        status: 'completed',
        processedAt: new Date()
      },
      { new: true }
    );

    console.log(`✓ Report ${reportId} processing completed successfully`);

    // Send email notification to patient
    try {
      const user = await User.findById(report.userId).select('name email');
      if (user && user.email) {
        await sendReportNotification(user.email, user.name, report.originalName || report.fileName, structuredData);
      }
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr.message);
    }

    return updatedReport;
  } catch (error) {
    console.error(`Error processing report ${reportId}: ${error.message}`);
    
    try {
      await Report.findByIdAndUpdate(reportId, {
        status: 'failed',
        analysisError: error.message
      });
    } catch (updateError) {
      console.error('Failed to update report status:', updateError.message);
    }
  }
}

// Extract key medical values from text
function extractKeyValues(text) {
  const analysis = [];
  
  const patterns = [
    { pattern: /(?:systolic|SBP)[\s:]*(\d+)\s*(?:mmHg)?/gi, parameter: 'Systolic BP', isAbnormal: (val) => val > 140 },
    { pattern: /(?:diastolic|DBP)[\s:]*(\d+)\s*(?:mmHg)?/gi, parameter: 'Diastolic BP', isAbnormal: (val) => val > 90 },
    { pattern: /(?:glucose|blood sugar|fasting)[\s:]*(\d+)\s*(?:mg\/dL)?/gi, parameter: 'Blood Glucose', isAbnormal: (val) => val > 100 },
    { pattern: /(?:hemoglobin|HbA1c)[\s:]*(\d+\.?\d*)\s*(?:g\/dL|%)?/gi, parameter: 'Hemoglobin', isAbnormal: (val) => val > 14 || val < 12 },
    { pattern: /(?:cholesterol|total)[\s:]*(\d+)\s*(?:mg\/dL)?/gi, parameter: 'Cholesterol', isAbnormal: (val) => val > 200 },
    { pattern: /(?:triglycerides)[\s:]*(\d+)\s*(?:mg\/dL)?/gi, parameter: 'Triglycerides', isAbnormal: (val) => val > 150 },
    { pattern: /(?:HDL)[\s:]*(\d+)\s*(?:mg\/dL)?/gi, parameter: 'Good Cholesterol (HDL)', isAbnormal: (val) => val < 40 },
    { pattern: /(?:LDL)[\s:]*(\d+)\s*(?:mg\/dL)?/gi, parameter: 'Bad Cholesterol (LDL)', isAbnormal: (val) => val > 100 }
  ];

  patterns.forEach(({ pattern, parameter, isAbnormal }) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      analysis.push({
        parameter: parameter,
        value: value,
        isAbnormal: isAbnormal(value),
        unit: 'See detailed report'
      });
    }
  });

  return analysis;
}
