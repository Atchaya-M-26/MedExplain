const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQR } = require('../controllers/qrController');

router.get('/:patientId', protect, generateQR);

module.exports = router;
