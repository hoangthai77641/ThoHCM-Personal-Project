const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getBankingConfig,
  updateBankingConfig,
  testQRGeneration
} = require('../controllers/bankingConfigController');

// Admin banking configuration routes
router.get('/config', auth, getBankingConfig);
router.put('/config', auth, updateBankingConfig);
router.post('/test-qr', auth, testQRGeneration);

module.exports = router;