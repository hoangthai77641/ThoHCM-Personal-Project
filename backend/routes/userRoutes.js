const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { uploadAvatar } = require('../middleware/upload-gcs');
const { 
  validateUserRegistration, 
  validateUserLogin,
  validateObjectIdParam,
  validatePagination
} = require('../middleware/validation');

// Register, đăng nhập with rate limiting and validation
router.post('/register', authLimiter, validateUserRegistration, userController.register);
router.post('/login', authLimiter, validateUserLogin, userController.login);
router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTP);

// Forgot password flow
router.post('/forgot-password', authLimiter, userController.forgotPassword);
router.post('/verify-reset-otp', authLimiter, userController.verifyOTP);
router.post('/reset-password', authLimiter, userController.resetPassword);

// profile
router.get('/me', auth(['customer','worker','admin']), userController.me);
router.put('/me', auth(['customer','worker','admin']), userController.updateMe);

// avatar
router.post('/avatar', auth(['customer','worker','admin']), (req, res, next) => {
  console.log('Avatar upload request received');
  console.log('User:', req.user);
  console.log('Headers:', req.headers);
  
  uploadAvatar(req, res, (err) => {
    if (err) {
      console.error('Upload middleware error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    console.log('Upload middleware success, file:', req.file);
    next();
  });
}, userController.uploadAvatar);
router.delete('/avatar', auth(['customer','worker','admin']), userController.deleteAvatar);

// toggle online status for workers
router.put('/toggle-online', auth(['worker']), userController.toggleOnlineStatus);

// customers (worker or admin)
router.get('/customers', auth(['worker','admin']), userController.getCustomers);
router.get('/customers/:id/bookings', auth(['worker','admin']), userController.getCustomerBookings);

// Find nearby workers (for customers)
router.get('/nearby-workers', auth(['customer', 'worker', 'admin']), userController.findNearbyWorkers);

// (Theo yêu cầu: không cho create user thủ công) -> vô hiệu hóa route create
// router.post('/', auth(['worker','admin']), userController.createUser);

// Get list of user (worker hoặc admin) - excludes admin by default
router.get('/', auth(['worker','admin']), validatePagination, userController.getUsers);

// Get administrators (admin only)
router.get('/administrators', auth(['admin']), validatePagination, userController.getAdministrators);

// Admin: Create admin account (admin only, or no auth for first admin)
router.post('/administrators', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Check if any admin exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      // No admin exists, allow creation without authentication
      return userController.createAdmin(req, res);
    } else {
      // Admin exists, require admin authentication
      return auth(['admin'])(req, res, () => userController.createAdmin(req, res));
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/status', auth(['admin']), validateObjectIdParam('id'), userController.updateUserStatus);
router.post('/workers', auth(['admin']), userController.adminCreateWorker);
router.put('/workers/:id', auth(['admin']), validateObjectIdParam('id'), userController.adminUpdateWorker);
router.delete('/workers/:id', auth(['admin']), validateObjectIdParam('id'), userController.adminDeleteWorker);

// Admin: manage worker approvals
router.get('/workers/pending', auth(['admin']), async (req, res) => {
	try {
		const User = require('../models/User');
		const users = await User.find({ role: 'worker', status: 'pending' }).select('name phone address createdAt');
		res.json(users);
	} catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/workers/:id/approve', auth(['admin']), async (req, res) => {
	try {
		const User = require('../models/User');
		const user = await User.findById(req.params.id);
		if (!user || user.role !== 'worker') return res.status(404).json({ message: 'Worker not found' });
		user.status = 'active';
		await user.save();
		res.json({ message: 'Approved' });
	} catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/workers/:id/suspend', auth(['admin']), async (req, res) => {
	try {
		const User = require('../models/User');
		const user = await User.findById(req.params.id);
		if (!user || user.role !== 'worker') return res.status(404).json({ message: 'Worker not found' });
		user.status = 'suspended';
		await user.save();
		res.json({ message: 'Suspended' });
	} catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
