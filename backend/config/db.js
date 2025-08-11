import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export default async function connectDB() {
  try {
    console.log("🔍 Environment variables:");
    console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set (hidden)" : "Not set");
    console.log("MONGODB_DB:", process.env.MONGODB_DB);

    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI is not defined - running in mock mode");
      console.warn("⚠️ Some features may not work without a database connection");
      console.warn("⚠️ To enable database features, create a .env file with MONGODB_URI");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "robobooks",
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.warn("⚠️ Running in mock mode - some features may not work");
    console.warn("⚠️ To fix database connection, check your MONGODB_URI and ensure MongoDB is running");
    // Don't exit the process, just log the warning
  }
}
