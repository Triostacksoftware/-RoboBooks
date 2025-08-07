import "dotenv/config";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

const createSuperAdmin = async () => {
  try {
    await connectDB();
    
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log("Super admin already exists!");
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@robobooks.com",
      role: "super_admin",
      permissions: [
        'manage_users',
        'manage_admins', 
        'view_analytics',
        'manage_content',
        'manage_settings',
        'view_reports',
        'manage_billing'
      ],
      department: "Administration"
    });

    // Set password
    await superAdmin.hashPassword("admin123");
    await superAdmin.save();

    console.log("✅ Super admin created successfully!");
    console.log("Email: admin@robobooks.com");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
