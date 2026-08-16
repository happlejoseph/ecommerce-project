

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js"


dotenv.config();

const createAdmin = async()=> {

    try {

        await mongoose.connect(process.env.MONGO_URL);

        const hashedPassword = await bcrypt.hash('123456', 10);

        const admin = await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log('Admin created successfully');
        console.log(admin);
        
    }
    catch(error) {

        console.log("Error:", error.message);
    }
}

createAdmin();