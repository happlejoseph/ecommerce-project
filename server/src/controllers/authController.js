

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/email.js";
import crypto from 'crypto';



// OTP //
const generateOTP = ()=> {

    return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp)=> {

    return crypto.createHash('sha256').update(otp).digest('hex');
}

const sendOTPEmail = async(email, otp)=> {
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your ORA Verification OTP',
        text: `Your verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`

    })
}




// REGISTER //
export const registerUser = async(req, res)=> {

    try {

        const {name, email, password,} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if(password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if(existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashPassword,
            isEmailVerified: false,
            emailVerificationOTP: hashOTP,
            emailVerificationOTPExpiry: new Date(Date.now() + 5 * 60 * 1000)
        });

        try {

            await sendOTPEmail(normalizedEmail, otp);
        }
        catch(error) {
            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                message: 'Failed to send verification email. Please try again'
            })
        }

        res.status(201).json({
            message: 'Registration successful. Please check your email for the verification OTP.',
                email: user.email
        });

    }

    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// verify //
export const verifyOTP = async(req, res)=> {
    
    try {

        const {email, otp} = req.body;

        if(!email || !otp) {
            return res.status(400).json({
                message: 'Email ans OTP required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({email: normalizedEmail});

        if(!user) {
            return res.status(404).json({
                message: 'User not fond'
            })
        }

        if(user.isEmailVerified) {
            return res.status(400).json({
                message: 'email is alresy varified'
            });
        }

        if(!user.emailVerificationOTP || !user.emailVerificationOTPExpiry) {
            return res.status(400).json({
                message: 'No verification OTP found. Please register again.'
            });
        }

        if(user.emailVerificationOTPExpiry < new Date()) {
            return res.status(400).json({
                message: 'OTP has expired. Please register again.'
            })
        }

        const hashedOTP = hashOTP(otp.toString());

        if(hashedOTP !== user.emailVerificationOTP) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpiry = undefined;

        await user.save();

        res.status(200).json({
            message: 'Email verified successfully.'
        })
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

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if(user.status === 'inactive') {
            return res.status(403).json({
                message: 'Your account has been deactivated'
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

        
        if(!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'JWT secret is not configured'
            })
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