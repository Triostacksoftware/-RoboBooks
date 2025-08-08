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

// Default super admin credentials
const DEFAULT_SUPER_ADMIN = {
  firstName: "Super",
  lastName: "Admin",
  email: "admin@robobooks.com",
  password: "admin123",
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
};

// Default admin roles and permissions
const ADMIN_ROLES = {
  super_admin: {
    name: "Super Administrator",
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
    ]
  },
  admin: {
    name: "Administrator",
    permissions: [
      "manage_users",
      "view_analytics",
      "manage_content",
      "view_reports",
      "manage_billing"
    ]
  },
  moderator: {
    name: "Moderator",
    permissions: [
      "view_analytics",
      "view_reports"
    ]
  }
};

// Sample admin accounts for testing
const SAMPLE_ADMINS = [
  {
    firstName: "John",
    lastName: "Manager",
    email: "manager@robobooks.com",
    password: "manager123",
    role: "admin",
    department: "Management",
    permissions: ADMIN_ROLES.admin.permissions
  },
  {
    firstName: "Sarah",
    lastName: "Analyst",
    email: "analyst@robobooks.com",
    password: "analyst123",
    role: "moderator",
    department: "Analytics",
    permissions: ADMIN_ROLES.moderator.permissions
  }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ 
      email: DEFAULT_SUPER_ADMIN.email 
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Super admin already exists");
      return existingSuperAdmin;
    }

    // Create super admin
    const superAdmin = new Admin({
      ...DEFAULT_SUPER_ADMIN,
      email: DEFAULT_SUPER_ADMIN.email.toLowerCase()
    });

    // Hash password
    await superAdmin.hashPassword(DEFAULT_SUPER_ADMIN.password);
    await superAdmin.save();

    console.log("✅ Super admin created successfully");
    console.log(`📧 Email: ${DEFAULT_SUPER_ADMIN.email}`);
    console.log(`🔑 Password: ${DEFAULT_SUPER_ADMIN.password}`);
    console.log(`👤 Role: ${DEFAULT_SUPER_ADMIN.role}`);

    return superAdmin;
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    throw error;
  }
}

async function createSampleAdmins() {
  try {
    const createdAdmins = [];

    for (const adminData of SAMPLE_ADMINS) {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ 
        email: adminData.email 
      });

      if (existingAdmin) {
        console.log(`⚠️  Admin ${adminData.email} already exists`);
        continue;
      }

      // Create admin
      const admin = new Admin({
        ...adminData,
        email: adminData.email.toLowerCase(),
        isActive: true
      });

      // Hash password
      await admin.hashPassword(adminData.password);
      await admin.save();

      createdAdmins.push(admin);
      console.log(`✅ Admin ${adminData.email} created successfully`);
    }

    return createdAdmins;
  } catch (error) {
    console.error("❌ Error creating sample admins:", error);
    throw error;
  }
}

async function setupAdminRoles() {
  try {
    console.log("📋 Setting up admin roles and permissions...");
    
    // Create role definitions (in production, this would be stored in a separate collection)
    const roles = Object.entries(ADMIN_ROLES).map(([key, role]) => ({
      name: key,
      displayName: role.name,
      permissions: role.permissions
    }));

    console.log("✅ Admin roles configured:");
    roles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name})`);
      console.log(`     Permissions: ${role.permissions.join(', ')}`);
    });

    return roles;
  } catch (error) {
    console.error("❌ Error setting up admin roles:", error);
    throw error;
  }
}

async function validateAdminPermissions() {
  try {
    console.log("🔍 Validating admin permissions...");

    const admins = await Admin.find({});
    const validPermissions = [
      "manage_users",
      "manage_admins", 
      "view_analytics",
      "manage_content",
      "manage_settings",
      "view_reports",
      "manage_billing",
      "manage_security",
      "manage_system"
    ];

    for (const admin of admins) {
      const invalidPermissions = admin.permissions.filter(
        perm => !validPermissions.includes(perm)
      );

      if (invalidPermissions.length > 0) {
        console.warn(`⚠️  Admin ${admin.email} has invalid permissions: ${invalidPermissions.join(', ')}`);
        
        // Remove invalid permissions
        admin.permissions = admin.permissions.filter(
          perm => validPermissions.includes(perm)
        );
        await admin.save();
        console.log(`✅ Fixed permissions for ${admin.email}`);
      }
    }

    console.log("✅ Admin permissions validated");
  } catch (error) {
    console.error("❌ Error validating admin permissions:", error);
    throw error;
  }
}

async function createAdminIndexes() {
  try {
    console.log("📊 Creating admin indexes...");

    // Create indexes for better query performance
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    await Admin.collection.createIndex({ role: 1 });
    await Admin.collection.createIndex({ isActive: 1 });
    await Admin.collection.createIndex({ createdAt: -1 });

    console.log("✅ Admin indexes created");
  } catch (error) {
    console.error("❌ Error creating admin indexes:", error);
    throw error;
  }
}

async function displayAdminSummary() {
  try {
    console.log("\n📊 Admin System Summary:");
    console.log("=" * 50);

    const admins = await Admin.find({}).select('firstName lastName email role isActive createdAt');
    
    console.log(`Total Admins: ${admins.length}`);
    console.log(`Active Admins: ${admins.filter(a => a.isActive).length}`);
    
    const roleCounts = {};
    admins.forEach(admin => {
      roleCounts[admin.role] = (roleCounts[admin.role] || 0) + 1;
    });

    console.log("\nRole Distribution:");
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    console.log("\nAdmin Accounts:");
    admins.forEach(admin => {
      const status = admin.isActive ? "✅ Active" : "❌ Inactive";
      console.log(`  ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.role} - ${status}`);
    });

    console.log("\n" + "=" * 50);
  } catch (error) {
    console.error("❌ Error displaying admin summary:", error);
  }
}

async function main() {
  try {
    console.log("🚀 Starting admin setup...");
    
    // Connect to database
    await connectDB();
    
    // Create super admin
    await createSuperAdmin();
    
    // Create sample admins
    await createSampleAdmins();
    
    // Setup admin roles
    await setupAdminRoles();
    
    // Validate permissions
    await validateAdminPermissions();
    
    // Create indexes
    await createAdminIndexes();
    
    // Display summary
    await displayAdminSummary();
    
    console.log("\n✅ Admin setup completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log("Super Admin: admin@robobooks.com / admin123");
    console.log("Manager: manager@robobooks.com / manager123");
    console.log("Analyst: analyst@robobooks.com / analyst123");
    
  } catch (error) {
    console.error("❌ Admin setup failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  createSuperAdmin,
  createSampleAdmins,
  setupAdminRoles,
  validateAdminPermissions,
  ADMIN_ROLES
};
