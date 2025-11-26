const express = require('express');
const router = express.Router();
const appVersionController = require('../controllers/appVersionController');
const { authenticateToken } = require('../middleware/auth');

// Public routes - không cần authentication
router.get('/check', appVersionController.checkVersion);
router.get('/latest', appVersionController.getLatestVersion);

// Admin routes - cần authentication
router.put(
  '/update',
  authenticateToken,
  appVersionController.updateVersionInfo,
);

module.exports = router;
