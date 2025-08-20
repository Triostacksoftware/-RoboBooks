import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function checkUserStatus() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find the test user
    const user = await User.findOne({ email: "test@example.com" });

    if (user) {
      console.log("📋 User Details:");
      console.log("Email:", user.email);
      console.log("Company:", user.companyName);
      console.log("Status:", user.approvalStatus);
      console.log("Is Active:", user.isActive);
      console.log("Approved At:", user.approvedAt);
      console.log("Created At:", user.createdAt);
    } else {
      console.log("❌ Test user not found");
    }

  } catch (error) {
    console.error("❌ Error checking user status:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkUserStatus();
