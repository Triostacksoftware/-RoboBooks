import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function testLoginLogic() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Simulate the exact login logic from the endpoint
    const emailOrPhone = "test@example.com";
    
    // Find user by email (same logic as login endpoint)
    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone.toLowerCase() }
      : { phone: emailOrPhone };

    console.log("🔍 Query:", query);
    
    const user = await User.findOne(query);
    
    console.log("🔍 User found:", {
      found: !!user,
      email: user?.email,
      approvalStatus: user?.approvalStatus,
      isActive: user?.isActive,
      hasPassword: !!user?.passwordHash,
      _id: user?._id
    });

    if (!user || !user.passwordHash) {
      console.log("❌ No user found or no password");
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ User is not active");
      return;
    }

    // Check if user is approved
    console.log("🔍 Checking approval status:", user.approvalStatus);
    console.log("🔍 Type of approvalStatus:", typeof user.approvalStatus);
    console.log("🔍 Is pending?", user.approvalStatus === "pending");
    
    if (user.approvalStatus === "pending") {
      console.log("❌ User approval status is pending");
      return;
    }

    if (user.approvalStatus === "rejected") {
      console.log("❌ User approval status is rejected");
      return;
    }

    console.log("✅ User passed all checks!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
testLoginLogic();
