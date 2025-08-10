import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing admin account...");

const MONGODB_URI = process.env.MONGODB_URI;

async function testAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin
    const admin = await Admin.findOne({ email: "admin@robobooks.com" });
    
    if (!admin) {
      console.log("❌ Admin not found!");
      return;
    }

    console.log("📋 Admin details:");
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Has passwordHash: ${!!admin.passwordHash}`);
    console.log(`- PasswordHash length: ${admin.passwordHash ? admin.passwordHash.length : 0}`);
    console.log(`- Is active: ${admin.isActive}`);

    // Check if password hash is valid
    if (!admin.passwordHash || admin.passwordHash.length < 10) {
      console.log("⚠️  Invalid password hash, fixing...");
      
      // Create new password hash
      const newHash = await bcrypt.hash("admin123", 12);
      admin.passwordHash = newHash;
      await admin.save();
      
      console.log("✅ Password hash fixed!");
      console.log(`- New hash length: ${admin.passwordHash.length}`);
    } else {
      console.log("✅ Password hash looks valid");
    }

    // Test password comparison
    console.log("🧪 Testing password comparison...");
    const isValid = await bcrypt.compare("admin123", admin.passwordHash);
    console.log(`- Password comparison result: ${isValid}`);

    if (isValid) {
      console.log("🎉 Admin account is ready!");
      console.log("📧 Email: admin@robobooks.com");
      console.log("🔑 Password: admin123");
    } else {
      console.log("❌ Password comparison failed!");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testAdmin();
