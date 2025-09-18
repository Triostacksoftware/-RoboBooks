import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function createNewTestUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Delete existing test user if exists
    await User.deleteOne({ email: "test@example.com" });
    console.log("🗑️ Deleted existing test user");

    // Hash password
    const passwordHash = await bcrypt.hash("password123", 12);

    // Create new test user with all required fields
    const testUser = await User.create({
      companyName: "Test Company",
      email: "test@example.com",
      phone: "1234567890",
      phoneDialCode: "+91",
      phoneIso2: "IN",
      passwordHash: passwordHash,
      country: "India",
      state: "Karnataka",
      isActive: true,
      approvalStatus: "approved",
      approvedAt: new Date(),
      role: "user"
    });

    console.log("✅ New test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("Company: Test Company");
    console.log("Status: Approved");
    console.log("User ID:", testUser._id);

  } catch (error) {
    console.error("❌ Error creating new test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createNewTestUser();


