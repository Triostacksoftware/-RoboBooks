import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function debugLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const emailOrPhone = "test@example.com";
    const password = "password123";

    console.log("Testing login logic...");
    console.log("Email/Phone:", emailOrPhone);
    console.log("Password:", password);

    // Find user by email or phone (same logic as login route)
    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone.toLowerCase() }
      : { phone: emailOrPhone };

    console.log("Query:", JSON.stringify(query, null, 2));

    const user = await User.findOne(query);
    console.log("User found:", !!user);

    if (user) {
      console.log("User details:");
      console.log("- Email:", user.email);
      console.log("- Phone:", user.phone);
      console.log("- Has passwordHash:", !!user.passwordHash);
      console.log("- Is active:", user.isActive);
      console.log("- PasswordHash length:", user.passwordHash?.length || 0);

      // Test password verification
      const match = await bcrypt.compare(password, user.passwordHash);
      console.log("Password match:", match);

      if (!user.passwordHash) {
        console.log("❌ User has no passwordHash");
      } else if (!user.isActive) {
        console.log("❌ User is not active");
      } else if (!match) {
        console.log("❌ Password does not match");
      } else {
        console.log("✅ All checks passed - login should succeed");
      }
    } else {
      console.log("❌ User not found");
    }

  } catch (error) {
    console.error("Error debugging login:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

debugLogin();
