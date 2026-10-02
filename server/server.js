

import "dotenv/config";

import express from "express";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";



const port = process.env.PORT || 3001;

const startServer = async()=> {

    try {

        await connectDB()

        app.listen(port, ()=> {
            console.log(`Server is running on ${port}`);
            
        });
    }

    catch(error) {
        console.error('Failed to start server:', error.message);
        process.exit(1)
    }
}

startServer();