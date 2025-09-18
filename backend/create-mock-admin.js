import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

async function createMockAdmins() {
  try {
    console.log("\n🔧 Creating Mock Admin Users...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Mock admin data
    const mockAdmins = [
      {
        firstName: "Super",
        lastName: "Administrator",
        email: "superadmin@robobooks.com",
        password: "super123",
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
        department: "System Administration",
        isActive: true
      },
      {
        firstName: "Admin",
        lastName: "Manager",
        email: "admin@robobooks.com",
        password: "admin123",
        role: "admin",
        permissions: [
          "manage_users",
          "view_analytics",
          "manage_content",
          "manage_settings",
          "view_reports",
          "manage_billing"
        ],
        department: "IT Administration",
        isActive: true
      },
      {
        firstName: "Content",
        lastName: "Moderator",
        email: "moderator@robobooks.com",
        password: "mod123",
        role: "moderator",
        permissions: [
          "view_analytics",
          "manage_content",
          "view_reports"
        ],
        department: "Content Management",
        isActive: true
      },
      {
        firstName: "Support",
        lastName: "Admin",
        email: "support@robobooks.com",
        password: "support123",
        role: "admin",
        permissions: [
          "manage_users",
          "view_analytics",
          "view_reports"
        ],
        department: "Customer Support",
        isActive: true
      },
      {
        firstName: "Finance",
        lastName: "Manager",
        email: "finance@robobooks.com",
        password: "finance123",
        role: "admin",
        permissions: [
          "view_analytics",
          "view_reports",
          "manage_billing"
        ],
        department: "Finance",
        isActive: true
      },
      {
        firstName: "Inactive",
        lastName: "Admin",
        email: "inactive@robobooks.com",
        password: "inactive123",
        role: "admin",
        permissions: ["view_analytics"],
        department: "Testing",
        isActive: false
      }
    ];

    console.log("📋 Creating mock admin users...\n");

    for (const adminData of mockAdmins) {
      try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        
        if (existingAdmin) {
          console.log(`ℹ️  Admin already exists: ${adminData.email} (${adminData.role})`);
          continue;
        }

        // Create new admin
        const admin = new Admin({
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          role: adminData.role,
          permissions: adminData.permissions,
          department: adminData.department,
          isActive: adminData.isActive
        });

        // Hash password
        await admin.hashPassword(adminData.password);
        await admin.save();

        console.log(`✅ Created ${adminData.role}: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Department: ${adminData.department}`);
        console.log(`   Active: ${adminData.isActive}`);
        console.log(`   Permissions: ${adminData.permissions.length} permissions\n`);

      } catch (error) {
        console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
      }
    }

    // Display summary
    console.log("📊 Mock Admin Summary:");
    console.log("=====================");
    
    const allAdmins = await Admin.find().select('email role isActive department');
    
    allAdmins.forEach(admin => {
      const status = admin.isActive ? "✅ Active" : "❌ Inactive";
      console.log(`${status} | ${admin.role.toUpperCase()} | ${admin.email} | ${admin.department}`);
    });

    console.log("\n🎉 Mock admin users created successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("===================");
    console.log("Super Admin: superadmin@robobooks.com / super123");
    console.log("Admin: admin@robobooks.com / admin123");
    console.log("Moderator: moderator@robobooks.com / mod123");
    console.log("Support: support@robobooks.com / support123");
    console.log("Finance: finance@robobooks.com / finance123");
    console.log("Inactive: inactive@robobooks.com / inactive123");

  } catch (error) {
    console.error("❌ Error creating mock admins:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createMockAdmins();


