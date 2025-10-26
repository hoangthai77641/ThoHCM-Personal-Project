const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Multer configuration for proof of payment uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../storage/proof-of-payment');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + req.user.userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Worker wallet routes
router.get('/', auth(['worker']), walletController.getWallet);
router.get('/my-wallet', auth(['worker']), walletController.getWallet); // Keep backward compatibility
router.post('/deposit', auth(['worker']), authLimiter, walletController.createDepositRequest);
router.post('/upload-proof', auth(['worker']), upload.single('proofImage'), walletController.uploadProofOfPayment);

// Admin routes
router.get('/stats', auth(['admin']), walletController.getWalletStats);
router.get('/all', auth(['admin']), walletController.getAllWallets);
router.post('/confirm-deposit', auth(['admin']), walletController.confirmDeposit);
router.get('/platform-fee-config', auth(['admin']), walletController.getPlatformFeeConfig);
router.put('/platform-fee-config', auth(['admin']), walletController.updatePlatformFeeConfig);
router.get('/pending-manual-deposits', auth(['admin']), walletController.getPendingManualDeposits);
router.post('/approve-manual-deposit/:transactionId', auth(['admin']), walletController.approveManualDeposit);
router.post('/reject-manual-deposit/:transactionId', auth(['admin']), walletController.rejectManualDeposit);

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