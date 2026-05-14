const express = require('express');
const router = express.Router();
const { sendEmergencySMS } = require('../controllers/smsController');

router.post('/send-emergency-sms', sendEmergencySMS);

module.exports = router;
