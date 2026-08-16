

import Jwt from "jsonwebtoken";
import User from "../models/User.js";




export const auth = async(req, res, next)=> {

    if(req.method === 'OPTIONS') {
        return next();
    }

    try {

        const token = req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const decoded = Jwt.verify(
            token, process.env.JWT_SECRET
        );

        req.user = decoded;
        next();
    }
    catch(error) {

        res.status(401).json({
            message: 'Invalid token'
        });
    }
}