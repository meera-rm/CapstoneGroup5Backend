const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET_KEY;

exports.authRequired = (req, res, next) => {
  try {
    const authHeaderValue = req.headers.authorization;
    jwt.verify(authHeaderValue, SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.ensureCorrectStudent = (req, res, next) => {
  try {
    const authHeaderValue = req.headers.authorization;
    const token = jwt.verify(authHeaderValue, SECRET);
    if (token.username === req.params.username) {
      return next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.ensureCorrectTeacher = (req, res, next) => {
  try {
    const authHeaderValue = req.headers.authorization;
    const token = jwt.verify(authHeaderValue, SECRET);
    if (token.handle === req.params.handle) {
      return next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};