const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Worker wallet routes
router.get('/', auth(['worker']), walletController.getWallet);
router.get('/my-wallet', auth(['worker']), walletController.getWallet); // Keep backward compatibility
router.post('/deposit', auth(['worker']), authLimiter, walletController.createDepositRequest);

// Admin routes
router.get('/stats', auth(['admin']), walletController.getWalletStats);
router.get('/all', auth(['admin']), walletController.getAllWallets);
router.post('/confirm-deposit', auth(['admin']), walletController.confirmDeposit);
router.get('/platform-fee-config', auth(['admin']), walletController.getPlatformFeeConfig);
router.put('/platform-fee-config', auth(['admin']), walletController.updatePlatformFeeConfig);

// Payment gateway webhooks and return URLs (no auth for external services)
router.get('/vnpay-return', walletController.vnpayReturn);
router.post('/vnpay-ipn', walletController.vnpayIPN);
router.post('/zalopay-callback', walletController.zalopayCallback);
router.post('/stripe-webhook', walletController.stripeWebhook);
router.get('/stripe-success', walletController.stripeSuccess);
router.get('/stripe-cancel', walletController.stripeCancel);

// Legacy webhook for manual confirmation
router.post('/webhook/payment-confirmed', walletController.confirmDeposit);

// Admin endpoint to fix pending transactions
router.post('/fix-pending', auth(['admin']), walletController.confirmAllPendingTransactions);

module.exports = router;