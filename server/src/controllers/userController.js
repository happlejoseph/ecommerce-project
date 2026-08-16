

import bcrypt from "bcryptjs";
import User from "../models/User.js";


// GET PROFILE //
export const getProfile = async(req, res)=> {

    try {

      const user = await User.findById(req.user.id).select('-password');

      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      res.status(200).json({
        message: 'Profile data',
        user
      });

    }
    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




// UPDATE PROFILE //
export const updateProfile = async(req, res)=> {

    try {

      const {name, email} = req.body;

      if(!name || !email) {
        return res.status(400).json({
          message: 'Name and email required'
        });
      }
      

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          name, email
        },
        {
          new: true
        }
      ).select('-password');


      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user
      });

    }

    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




// GET ALL USERS //
export const getAllUsers = async(req, res)=> {

    try {

      const users = await User.find().select('-password');

      res.status(200).json({
        message: 'User fetched successfully',
        users
      });

    }
    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




// FORGOT PASSWORD //
export const forgotPassword = async(req, res)=> {

    try {

      const {email} = req.body;

      const user = await User.findOne({email});

      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      user.resetPasswordOTP = otp;

      user.resetPasswordOTPExpiry = new Date(Date.now() + 10 *60 * 1000);

      await user.save();

      res.status(200).json({
        message: 'Otp generated successfully',
        otp
      });

    }
    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




// VERIFY RESET OTP //
export const verifyResetOtp = async(req, res)=> {

    try {

      const {email, otp} = req.body;

      const user = await User.findOne({email});

      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      if(user.resetPasswordOTP !== otp) {
        return res.status(404).json({
          message: 'Invalied OTP'
        });
      }

      if(new Date() > user.resetPasswordOTPExpiry) {
        return res.status(400).json({
          message: 'OTP expired'
        });
      }

      res.status(200).json({
        message: 'OTP varified successfully'
      });

      
    }
    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




// RESET PASSWORD //
export const resetPassword = async(req, res)=> {

    try {

      const {email, otp, newPassword} = req.body;

      const user = await User.findOne({email});

      if(!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      if(user.resetPasswordOTP !== otp) {
        return res.status(400).json({
          message: 'Invalied OTP'
        });
      }

      if(new Date() > user.resetPasswordOTPExpiry) {
        return res.status(400).json({
          message: 'OTP expired'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;

      await user.save();

      res.status(200).json({
        message: 'Password reset successfully'
      });

      
    }
    catch(error) {

      res.status(500).json({
        message: error.message
      });
    }
}




