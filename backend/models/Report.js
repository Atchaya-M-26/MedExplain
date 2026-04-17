const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true
  },
  value: String,
  unit: String,
  referenceRange: String,
  isAbnormal: Boolean,
  explanation: String
});

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  // Human-readable original filename (used for duplicate detection)
  originalName: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  extractedText: String,
  // @deprecated — legacy fields kept for backward compatibility
  simplifiedSummary: mongoose.Schema.Types.Mixed,
  // @deprecated — legacy fields kept for backward compatibility
  abnormalFindings: [String],
  // @deprecated — legacy fields kept for backward compatibility
  analysis: [analysisSchema],
  summary: String,
  language: {
    type: String,
    default: 'en'
  },
  processedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  analysisError: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
});

// Index for duplicate detection by user + original filename
reportSchema.index({ userId: 1, originalName: 1 });

module.exports = mongoose.model('Report', reportSchema);
