import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting quick admin creation...");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined");
  process.exit(1);
}

async function createQuickAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔍 Checking for existing admin...");
    const existingAdmin = await Admin.findOne({ email: "admin@robobooks.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin exists, updating password...");
      existingAdmin.passwordHash = await bcrypt.hash("admin123", 12);
      await existingAdmin.save();
      console.log("✅ Password updated!");
    } else {
      console.log("🔧 Creating new admin...");
      const admin = new Admin({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@robobooks.com",
        passwordHash: await bcrypt.hash("admin123", 12),
        role: "super_admin",
        permissions: ["manage_users", "manage_admins", "view_analytics", "manage_content", "manage_settings", "view_reports", "manage_billing"],
        department: "Administration",
        isActive: true
      });
      await admin.save();
      console.log("✅ Admin created!");
    }

    console.log("\n🎉 SUCCESS! Admin is ready!");
    console.log("📧 Email: admin@robobooks.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role: super_admin");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createQuickAdmin();
