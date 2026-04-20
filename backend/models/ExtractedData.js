const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  parameter: String,
  value: String,
  unit: String,
  referenceRange: String,
  isAbnormal: Boolean
});

const insightSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['duplicate_medication', 'dosage_note', 'followup_suggested']
  },
  message: String
});

const extractedDataSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  condition: {
    type: String,
    default: 'General Checkup'
  },
  medications: {
    type: [String],
    default: []
  },
  dosage: {
    type: [String],
    default: []
  },
  testResults: [testResultSchema],
  visitDate: {
    type: Date,
    default: null
  },
  summary: {
    type: String,
    default: ''
  },
  insights: [insightSchema],
  // Full clinical analysis JSON (all 8 sections)
  clinicalAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

extractedDataSchema.index({ userId: 1, visitDate: -1 });

module.exports = mongoose.model('ExtractedData', extractedDataSchema);
