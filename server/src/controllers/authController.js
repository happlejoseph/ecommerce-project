

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
            emailVerificationOTP: hashedOTP,
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
                email: user.email, otp
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
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({
                message: 'Your account has been deactivated'
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'JWT secret is not configured'
            });
        }

        if (user.role === 'admin') {
            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '6d'
                }
            );

            return res.status(200).json({
                message: 'Admin login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in'
            });
        }

        const otp = generateOTP();

        user.loginOTP = hashOTP(otp);
        user.loginOTPExpiry = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await user.save();

        try {
            await sendOTPEmail(user.email, otp);
        } catch (emailError) {
            console.error(
                'Login OTP email error:',
                emailError.message
            );

            user.loginOTP = undefined;
            user.loginOTPExpiry = undefined;

            await user.save();

            return res.status(500).json({
                message: 'Unable to send login OTP. Please try again.'
            });
        }

        return res.status(200).json({
            message: 'Login OTP sent to your email. Please verify to continue.',
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'An error occurred during login'
        });
    }
};




// VERIFY LOGIN OTP //
export const verifyLoginOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({
                message: 'Your account has been deactivated'
            });
        }

        if (!user.loginOTP || !user.loginOTPExpiry) {
            return res.status(400).json({
                message: 'No login OTP found. Please log in again.'
            });
        }

        if (user.loginOTPExpiry < new Date()) {
            user.loginOTP = undefined;
            user.loginOTPExpiry = undefined;
            await user.save();

            return res.status(400).json({
                message: 'Login OTP has expired. Please log in again.'
            });
        }

        const hashedOTP = hashOTP(otp.toString());

        if (hashedOTP !== user.loginOTP) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'JWT secret is not configured'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '6d'
            }
        );

        user.loginOTP = undefined;
        user.loginOTPExpiry = undefined;

        await user.save();

        return res.status(200).json({
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
    
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};





// RESEND LOGIN OTP //
export const resendLoginOTP = async (req, res) => {

    try {
        
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({
                message: 'Your account has been deactivated'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in'
            });
        }

        const otp = generateOTP();

        user.loginOTP = hashOTP(otp);
        user.loginOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);

        await user.save();

        try {

            await sendOTPEmail(user.email, otp);
        }
        catch (emailError) {
            user.loginOTP = undefined;
            user.loginOTPExpiry = undefined;

            await user.save();

            return res.status(500).json({
                message: 'Unable to resend login OTP. Please try again.'
            });
        }

        return res.status(200).json({
            message: 'A new login OTP has been sent to your email.',
            email: user.email
        });

    }
    
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
