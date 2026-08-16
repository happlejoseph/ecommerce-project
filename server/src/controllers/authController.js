

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";




// REGISTER //
export const registerUser = async(req, res)=> {

    try {

        const {name, email, password,} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password:hashPassword,
        });

        res.status(201).json({
            message: 'User registered successfully',
            user
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}


// LOGIN //
export const loginUser = async(req, res)=> {

    try {

        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password, user.password
        );

        if(!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            {
                id: user._id, role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '6d'
            }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}