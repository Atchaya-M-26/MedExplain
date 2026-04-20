const mongoose = require('mongoose');

const ImageAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageType: {
      type: String,
      enum: ['chest-xray', 'ct-scan', 'mri'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    prediction: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    findings: {
      type: [String],
      required: true
    },
    recommendation: {
      type: String,
      required: true
    },
    // Additional fields for specific image types
    chestXrayData: {
      normalProbability: Number,
      abnormalProbability: Number,
      interpretation: String
    },
    ctScanData: {
      probabilities: {
        normal: Number,
        suspicious: Number,
        abnormal: Number
      }
    },
    mriData: {
      normalProbability: Number,
      abnormalProbability: Number
    },
    // Doctor notes
    doctorNotes: {
      type: String,
      default: ''
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'diagnosed'],
      default: 'pending'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
ImageAnalysisSchema.index({ userId: 1, createdAt: -1 });
ImageAnalysisSchema.index({ userId: 1, isDeleted: 1 });
ImageAnalysisSchema.index({ imageType: 1 });
ImageAnalysisSchema.index({ doctorId: 1 });

module.exports = mongoose.model('ImageAnalysis', ImageAnalysisSchema);
