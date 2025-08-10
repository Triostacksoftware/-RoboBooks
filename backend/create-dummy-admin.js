import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function createDummyAdmin() {
  try {
    console.log("🔧 Creating dummy admin...");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@robobooks.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin already exists, updating password...");
      
      // Update password hash
      existingAdmin.passwordHash = await bcrypt.hash("admin123", 12);
      await existingAdmin.save();
      
      console.log("✅ Admin password updated successfully");
      console.log("📧 Email: admin@robobooks.com");
      console.log("🔑 Password: admin123");
      return existingAdmin;
    }

    // Create new admin
    const dummyAdmin = new Admin({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@robobooks.com",
      role: "super_admin",
      permissions: [
        "manage_users",
        "manage_admins", 
        "view_analytics",
        "manage_content",
        "manage_settings",
        "view_reports",
        "manage_billing",
        "manage_security",
        "manage_system"
      ],
      department: "Administration",
      isActive: true
    });

    // Hash password
    dummyAdmin.passwordHash = await bcrypt.hash("admin123", 12);
    await dummyAdmin.save();

    console.log("✅ Dummy admin created successfully");
    console.log("📧 Email: admin@robobooks.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role: super_admin");

    return dummyAdmin;

  } catch (error) {
    console.error("❌ Error creating dummy admin:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Starting dummy admin creation...");
    
    // Connect to database
    await connectDB();
    
    // Create dummy admin
    const admin = await createDummyAdmin();
    
    console.log("\n✅ Dummy admin setup completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log("Email: admin@robobooks.com");
    console.log("Password: admin123");
    console.log("Role: super_admin");
    
    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({ email: "admin@robobooks.com" });
    if (verifyAdmin) {
      console.log("\n✅ Admin verified in database:");
      console.log(`- Email: ${verifyAdmin.email}`);
      console.log(`- Role: ${verifyAdmin.role}`);
      console.log(`- Has password hash: ${!!verifyAdmin.passwordHash}`);
      console.log(`- Is active: ${verifyAdmin.isActive}`);
    }
    
  } catch (error) {
    console.error("❌ Dummy admin creation failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createDummyAdmin };
