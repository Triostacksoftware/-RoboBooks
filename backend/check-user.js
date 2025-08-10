import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function checkUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the test user
    const user = await User.findOne({ email: "test@example.com" });
    
    if (!user) {
      console.log("❌ Test user not found");
      return;
    }

    console.log("✅ Test user found:");
    console.log("Email:", user.email);
    console.log("Company:", user.companyName);
    console.log("Has passwordHash:", !!user.passwordHash);
    console.log("PasswordHash length:", user.passwordHash?.length || 0);

    // Test password verification
    const testPassword = "password123";
    const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
    console.log("Password verification:", isMatch ? "✅ Match" : "❌ No match");

    // Test with wrong password
    const wrongPassword = "wrongpassword";
    const isWrongMatch = await bcrypt.compare(wrongPassword, user.passwordHash);
    console.log("Wrong password test:", isWrongMatch ? "❌ Should not match" : "✅ Correctly rejected");

  } catch (error) {
    console.error("Error checking user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkUser();
