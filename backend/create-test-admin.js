import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

async function createTestAdmin() {
  try {
    console.log("\n🔧 Creating Test Admin User...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@robobooks.com" });
    
    if (existingAdmin) {
      console.log("ℹ️ Test admin already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      console.log("\n✅ Test admin is ready for login");
      return;
    }

    // Create new test admin
    const testAdmin = new Admin({
      firstName: "Test",
      lastName: "Administrator",
      email: "admin@robobooks.com",
      role: "admin",
      permissions: [
        "manage_users",
        "view_analytics",
        "manage_content",
        "manage_settings",
        "view_reports",
        "manage_billing"
      ],
      isActive: true,
      department: "IT Administration"
    });

    // Hash password
    await testAdmin.hashPassword("admin123");
    await testAdmin.save();

    console.log("✅ Test admin created successfully:");
    console.log(`   Email: ${testAdmin.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Name: ${testAdmin.firstName} ${testAdmin.lastName}`);
    console.log(`   Role: ${testAdmin.role}`);
    console.log(`   Permissions: ${testAdmin.permissions.join(", ")}`);
    console.log("\n🎉 You can now login to the admin panel with these credentials!");

  } catch (error) {
    console.error("❌ Error creating test admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createTestAdmin();
