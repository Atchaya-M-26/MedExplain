const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const imageController = require('../controllers/imageController');

const router = express.Router();

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ==================== ROUTES ====================

// Analyze chest X-ray
router.post('/analyze/chest-xray', protect, upload.single('file'), imageController.analyzeChestXray);

// Analyze CT scan
router.post('/analyze/ct-scan', protect, upload.single('file'), imageController.analyzeCTScan);

// Analyze MRI
router.post('/analyze/mri', protect, upload.single('file'), imageController.analyzeMRI);

// Get user's analysis history
router.get('/history', protect, imageController.getUserAnalysisHistory);

// Get deleted analysis history
router.get('/deleted/history', protect, imageController.getDeletedAnalysisHistory);

// Doctor: Get analyses for their patients
router.get('/doctor/analyses', protect, imageController.getDoctorAnalyses);

// Specific ID operations - MUST come before generic /:id route
// Restore deleted analysis
router.patch('/:id/restore', protect, imageController.restoreAnalysis);

// Permanently delete analysis (hard delete - removes from database)
router.delete('/:id/permanent', protect, imageController.permanentlyDeleteAnalysis);

// Doctor: Add notes to analysis
router.post('/:id/notes', protect, imageController.addDoctorNotes);

// Generic ID operations - MUST come last
// Get specific analysis
router.get('/:id', protect, imageController.getAnalysisById);

// Delete analysis (soft delete - moves to deleted history)
router.delete('/:id', protect, imageController.deleteAnalysis);

module.exports = router;
