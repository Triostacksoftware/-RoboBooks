import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function approveTestUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find and update the test user
    const updatedUser = await User.findOneAndUpdate(
      { email: "test@example.com" },
      { 
        approvalStatus: "approved",
        approvedAt: new Date(),
        isActive: true
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("✅ Test user approved successfully!");
      console.log("Email: test@example.com");
      console.log("Password: password123");
      console.log("Status:", updatedUser.approvalStatus);
      console.log("Company:", updatedUser.companyName);
    } else {
      console.log("❌ Test user not found");
    }

  } catch (error) {
    console.error("❌ Error approving test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
approveTestUser();
