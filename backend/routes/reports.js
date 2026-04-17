const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadReport, getReports, getReport, deleteReport, getDeletedReports, restoreReport, permanentlyDeleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|jpeg|jpg|png|tiff/;
    const mimeTypes = /application\/pdf|image\/jpeg|image\/jpg|image\/png|image\/tiff/;
    
    if (fileTypes.test(path.extname(file.originalname).toLowerCase()) &&
        mimeTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

router.post('/upload', protect, upload.single('file'), uploadReport);
router.get('/deleted/history', protect, getDeletedReports);
router.patch('/:id/restore', protect, restoreReport);
router.delete('/:id/permanent', protect, permanentlyDeleteReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReport);
router.delete('/:id', protect, deleteReport);

module.exports = router;
