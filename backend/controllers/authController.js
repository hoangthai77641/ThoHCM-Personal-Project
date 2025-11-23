const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign access token
function signAccessToken(user, version) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, v: version },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '5m' }
  );
}

// Helper to sign refresh token
function signRefreshToken(user, version) {
  return jwt.sign(
    { id: user._id, role: user.role, v: version, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
  );
}

// Common cookie options (secure true in production)
function cookieOpts(maxAgeMs, path = '/', httpOnly = true) {
  return {
    httpOnly,
    secure: (process.env.NODE_ENV === 'production'),
    sameSite: 'Strict',
    path,
    maxAge: maxAgeMs
  };
}

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account not active', status: user.status });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

    // Increment tokenVersion on successful login to invalidate old refresh tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const accessToken = signAccessToken(user, user.tokenVersion);
    const refreshToken = signRefreshToken(user, user.tokenVersion);

    // Set httpOnly cookies
    res.cookie('access_token', accessToken, cookieOpts(5 * 60 * 1000)); // 5m
    // Scope refresh token cookie to refresh endpoint path for reduced surface
    res.cookie('refresh_token', refreshToken, cookieOpts(30 * 24 * 60 * 60 * 1000, '/api/auth/refresh'));

    const sanitized = user.toObject({ versionKey: false });
    delete sanitized.password;
    delete sanitized.resetOTP;
    sanitized.id = sanitized._id;

    // Return access token for in-memory (e.g., Socket.IO) use only
    res.json({ user: sanitized, accessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies['refresh_token'];
    if (!token) return res.status(401).json({ message: 'Missing refresh token' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (decoded.type !== 'refresh') return res.status(401).json({ message: 'Token type mismatch' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Ensure tokenVersion matches for rotation / revocation
    if ((user.tokenVersion || 0) !== decoded.v) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    // Rotate refresh token (keep same version for now)
    const newAccessToken = signAccessToken(user, user.tokenVersion);
    const newRefreshToken = signRefreshToken(user, user.tokenVersion);

    res.cookie('access_token', newAccessToken, cookieOpts(5 * 60 * 1000));
    res.cookie('refresh_token', newRefreshToken, cookieOpts(30 * 24 * 60 * 60 * 1000, '/api/auth/refresh'));

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.tokenVersion = (user.tokenVersion || 0) + 1; // revoke existing refresh tokens
      await user.save();
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
