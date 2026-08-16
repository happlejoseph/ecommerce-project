

import "dotenv/config";

import express from "express";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();

const port = process.env.PORT;

app.listen(port, ()=> {
    console.log(`Server is running on ${port}`);
});