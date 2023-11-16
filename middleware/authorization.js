const jwt = require('jsonwebtoken');

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

module.exports = authenticateToken;