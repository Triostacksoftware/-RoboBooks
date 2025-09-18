import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function recreateTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing test user
    await User.deleteOne({ email: "test@example.com" });
    console.log("Deleted existing test user");

    // Create test user with correct password field
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
    console.log("Test user recreated successfully:", testUser.email);
    console.log("Email: test@example.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("Error recreating test user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

recreateTestUser();


