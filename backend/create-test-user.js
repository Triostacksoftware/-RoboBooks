import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    
    if (existingUser) {
      console.log("Test user already exists:", existingUser.email);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    
    const testUser = new User({
      companyName: "Test Company",
      email: "test@example.com",
      phone: "9876543210",
      passwordHash: hashedPassword,
      country: "India",
      state: "Uttar Pradesh",
    });

    await testUser.save();
    console.log("Test user created successfully:", testUser.email);
    console.log("Email: test@example.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createTestUser();
