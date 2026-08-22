const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  // DEVELOPMENT MODE: Bypass auth for testing
  if (process.env.NODE_ENV === 'development') {
    // Use a fake but valid MongoDB-like ID for dev mode
    req.user = '507f1f77bcf86cd799439011'; // A valid ObjectId format
    req.userRole = 'admin';
    req.isDev = true;
    return next();
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is banned
      const user = await User.findById(decoded.id).select('isBanned role');
      if (!user) return res.status(401).json({ message: 'User not found' });
      if (user.isBanned) return res.status(403).json({ message: 'Your account has been suspended' });

      req.user = decoded.id;
      req.userRole = decoded.role || user.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, authorize };
