const express = require('express');
const router = express.Router();
const appVersionController = require('../controllers/appVersionController');
const auth = require('../middleware/auth');

// Public routes - không cần authentication
router.get('/check', appVersionController.checkVersion);
router.get('/latest', appVersionController.getLatestVersion);

// Admin routes - cần authentication
router.put('/update', auth(['admin']), appVersionController.updateVersionInfo);

module.exports = router;
