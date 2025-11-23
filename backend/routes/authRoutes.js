const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/security');
const { validateUserLogin } = require('../middleware/validation');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login issues short-lived access token + long-lived refresh token (httpOnly cookies)
router.post('/login', authLimiter, validateUserLogin, authController.login);
// Refresh rotates both tokens
router.post('/refresh', authController.refresh);
// Logout clears cookies and revokes refresh tokens by bumping tokenVersion
router.post('/logout', auth(['customer','worker','driver','admin']), authController.logout);

module.exports = router;