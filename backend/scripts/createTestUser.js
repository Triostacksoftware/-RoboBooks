import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("ℹ️ Test user already exists");
      console.log("Email: test@example.com");
      console.log("Password: password123");
      console.log("Status:", existingUser.approvalStatus);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash("password123", 12);

    // Create test user
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
      approvalStatus: "approved", // Set as approved so they can login
      approvedAt: new Date(),
    });

    console.log("✅ Test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("Company: Test Company");
    console.log("Status: Approved");

  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createTestUser();
