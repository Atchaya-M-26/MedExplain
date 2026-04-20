const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getPatient } = require('../controllers/doctorController');

router.get('/patient/:patientId', protect, requireRole('doctor'), getPatient);

module.exports = router;
