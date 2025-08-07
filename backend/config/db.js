import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export default async function connectDB() {
  try {
    console.log("🔍 Environment variables:");
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    console.log("MONGODB_DB:", process.env.MONGODB_DB);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "robobooks",
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
