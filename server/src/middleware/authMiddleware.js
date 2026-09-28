

import Jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {

    if(req.method === "OPTIONS") {
        return next();
    }

    try {

        const token = req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = Jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id).select(
            "_id name email role status"
        );

        if(!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if(user.status === "inactive") {
            return res.status(403).json({
                message: "Your account has been deactivated"
            });
        }

        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        next();
    }
    
    catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};