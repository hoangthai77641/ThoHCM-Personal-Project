const jwt = require('jsonwebtoken');
const MSG = require('../constants/messages');

module.exports = function (roles = []) {
  // roles: array hoặc string
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    // Fallback: allow cookie-based access token if Authorization header absent
    if (!token && req.cookies && req.cookies['access_token']) {
      token = req.cookies['access_token'];
    }
    if (!token) return res.status(401).json({ message: MSG.MIDDLEWARE.NO_TOKEN });
    try {
      // Verify JWT with strong secret requirement
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Additional security checks
      if (!decoded.id || !decoded.role) {
        return res.status(401).json({ message: MSG.MIDDLEWARE.TOKEN_INVALID });
      }
      
      // Check token expiration more strictly
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return res.status(401).json({ message: MSG.MIDDLEWARE.TOKEN_EXPIRED });
      }
      
      req.user = decoded;
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: MSG.MIDDLEWARE.ACCESS_DENIED });
      }
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: MSG.MIDDLEWARE.TOKEN_EXPIRED });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: MSG.MIDDLEWARE.TOKEN_INVALID });
      } else {
        return res.status(500).json({ message: MSG.COMMON.INTERNAL_ERROR });
      }
    }
  };
};
