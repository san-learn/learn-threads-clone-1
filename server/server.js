import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import { app, server } from "./socket/socket.js";

import { connectToDatabase } from "./database/connect.js";

import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import messageRoutes from "./routes/message.js";

dotenv.config();

connectToDatabase();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/message", messageRoutes);

server.listen(PORT, () => {
  console.log(`\nServer is running on port: http://localhost:${PORT}`);
});
