const jwt = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;


// Same name and same return value as before, so your existing login code still works
function jwtTokens(user) {

  const payload = {
    id: user.user_id,
    username: user.user_name,
    email: user.user_email,
    role: user.user_role || user.role,
    avatar: user.user_avatar || user.avatar || ''
   };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  // Refresh token only needs the id. The refresh route looks the user up again,
  // so a role change takes effect on the next refresh.
  const refreshToken = jwt.sign({ id: user.user_id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function verifyToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}



// Keeps both import styles working:
//   const jwtTokens = require('../utils/jwt-helpers');
//   const { verifyToken } = require('../utils/jwt-helpers');

module.exports = { jwtTokens, verifyToken, verifyRefreshToken };



/*
function authenticateToken(req, res, next) {
    // get the token out of the header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // if token is null
    if(!token) return res.status(401).json({error: 'Null Token'});
    
    // verify token 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => { 
        // if not verified
        if(error){
            // set res to 401
            return res.status(401).json({error: 'Invalid Token'})
        }

        req.user = user;

        //continue on!
        next();
    })      
}

module.exports = authenticateToken
*/