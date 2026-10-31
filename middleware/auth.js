
const { verifyToken } = require('../utils/jwt-helpers');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    req.user = verifyToken(token);   //{ id, username, email, role, avatar, iat, exp }
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired, please log in again'
      : 'Invalid token';
    return res.status(401).json({ error: message });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    if (!allowedRoles.includes(req.user.role))  {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };


