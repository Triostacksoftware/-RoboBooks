import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function forceApproveUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Force update the user with explicit approval status
    const result = await User.updateOne(
      { email: "test@example.com" },
      { 
        $set: {
          approvalStatus: "approved",
          approvedAt: new Date(),
          isActive: true
        }
      }
    );

    console.log("Update result:", result);

    if (result.modifiedCount > 0) {
      console.log("✅ User approval status updated successfully!");
    } else {
      console.log("⚠️ No changes made to user");
    }

    // Verify the update
    const updatedUser = await User.findOne({ email: "test@example.com" });
    if (updatedUser) {
      console.log("✅ Verification - Updated user details:");
      console.log("Email:", updatedUser.email);
      console.log("Approval Status:", updatedUser.approvalStatus);
      console.log("Is Active:", updatedUser.isActive);
      console.log("Approved At:", updatedUser.approvedAt);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
forceApproveUser();
