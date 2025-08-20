import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

dotenv.config();

async function debugLogin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check both collections
    console.log("\n🔍 Checking User collection:");
    const users = await User.find({ email: "test@example.com" });
    console.log("Users found:", users.length);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        companyName: user.companyName
      });
    });

    console.log("\n🔍 Checking PendingUser collection:");
    const pendingUsers = await PendingUser.find({ email: "test@example.com" });
    console.log("Pending users found:", pendingUsers.length);
    pendingUsers.forEach((user, index) => {
      console.log(`Pending User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        status: user.status,
        companyName: user.companyName
      });
    });

    // Check if there are any users with similar emails
    console.log("\n🔍 Checking for similar emails:");
    const similarUsers = await User.find({ email: { $regex: "test", $options: "i" } });
    console.log("Similar users found:", similarUsers.length);
    similarUsers.forEach((user, index) => {
      console.log(`Similar User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive
      });
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
debugLogin();
