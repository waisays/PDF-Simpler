const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    const token  = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: 'Authentication required.' });
      req.user = null;
      return next();
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      if (required) return res.status(401).json({ error: 'Invalid or expired token.' });
      req.user = null;
      next();
    }
  };
};
