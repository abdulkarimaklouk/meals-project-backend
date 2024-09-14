const jwt = require("jsonwebtoken");
const { ERROR, FAIL } = require("../utils/httpStatusText");
const appError = require("../utils/appError");


const verifyToken =  (req, res , next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if(!authHeader){
        const error = appError.create("token is required", 401 , FAIL);
        return next(error);
    }
    try{
        const token = authHeader.split(' ')[1];
        jwt.verify(token , process.env.JWT_SECRET_KEY);
        next();
    }catch(err) {
        const error = appError.create("invalid token", 401 , ERROR);
        return next(error);
    }
}

module.exports = verifyToken;