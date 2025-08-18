import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import User from "./models/User.js";
import PendingUser from "./models/PendingUser.js";

dotenv.config();

async function createMockData() {
  try {
    console.log("\n🔧 Creating Complete Mock Data...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clean up existing mock data
    console.log("🧹 Cleaning up existing mock data...");
    await Admin.deleteMany({ email: { $regex: /@robobooks\.com$/ } });
    await User.deleteMany({
      email: {
        $regex:
          /@(techstart|digitalinnovations|globalenterprises|startuphub|establishedcorp|professionalservices|enterprisesolutions|suspiciouscompany|testcompany)\.com$/,
      },
    });
    await PendingUser.deleteMany({
      email: {
        $regex:
          /@(techstart|digitalinnovations|globalenterprises|startuphub|establishedcorp|professionalservices|enterprisesolutions|suspiciouscompany|testcompany)\.com$/,
      },
    });
    console.log("✅ Cleanup completed\n");

    // 1. Create Mock Admins
    console.log("👥 Creating Mock Admin Users...");
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
        ],
        department: "System Administration",
        isActive: true,
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
          "manage_billing",
        ],
        department: "IT Administration",
        isActive: true,
      },
      {
        firstName: "Content",
        lastName: "Moderator",
        email: "moderator@robobooks.com",
        password: "mod123",
        role: "moderator",
        permissions: ["view_analytics", "manage_content", "view_reports"],
        department: "Content Management",
        isActive: true,
      },
    ];

    for (const adminData of mockAdmins) {
      const admin = new Admin({
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions,
        department: adminData.department,
        isActive: adminData.isActive,
      });

      await admin.hashPassword(adminData.password);
      await admin.save();
      console.log(`✅ Created ${adminData.role}: ${adminData.email}`);
    }

    // 2. Create Mock Pending Users
    console.log("\n⏳ Creating Mock Pending Users...");
    const mockPendingUsers = [
      {
        companyName: "TechStart Solutions",
        email: "ceo@techstart.com",
        phone: "9876543210",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Maharashtra",
        status: "pending",
      },
      {
        companyName: "Digital Innovations Ltd",
        email: "admin@digitalinnovations.com",
        phone: "9876543211",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Karnataka",
        status: "pending",
      },
      {
        companyName: "Global Enterprises",
        email: "manager@globalenterprises.com",
        phone: "9876543212",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Delhi",
        status: "pending",
      },
      {
        companyName: "Startup Hub",
        email: "founder@startuphub.com",
        phone: "9876543213",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Telangana",
        status: "pending",
      },
    ];

    for (const userData of mockPendingUsers) {
      const pendingUser = new PendingUser({
        companyName: userData.companyName,
        email: userData.email,
        phone: userData.phone,
        phoneDialCode: userData.phoneDialCode,
        phoneIso2: userData.phoneIso2,
        passwordHash: await bcrypt.hash(userData.password, 12),
        country: userData.country,
        state: userData.state,
        status: userData.status,
      });

      await pendingUser.save();
      console.log(
        `✅ Created pending user: ${userData.companyName} (${userData.email})`
      );
    }

    // 3. Create Mock Approved Users
    console.log("\n✅ Creating Mock Approved Users...");
    const mockApprovedUsers = [
      {
        companyName: "Established Corp",
        email: "admin@establishedcorp.com",
        phone: "9876543220",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Tamil Nadu",
        approvalStatus: "approved",
      },
      {
        companyName: "Professional Services",
        email: "manager@professionalservices.com",
        phone: "9876543221",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Gujarat",
        approvalStatus: "approved",
      },
      {
        companyName: "Enterprise Solutions",
        email: "ceo@enterprisesolutions.com",
        phone: "9876543222",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Rajasthan",
        approvalStatus: "approved",
      },
    ];

    for (const userData of mockApprovedUsers) {
      const user = new User({
        companyName: userData.companyName,
        email: userData.email,
        phone: userData.phone,
        phoneDialCode: userData.phoneDialCode,
        phoneIso2: userData.phoneIso2,
        passwordHash: await bcrypt.hash(userData.password, 12),
        country: userData.country,
        state: userData.state,
        approvalStatus: userData.approvalStatus,
        approvedBy: (await Admin.findOne({ role: "admin" }))._id,
        approvedAt: new Date(),
      });

      await user.save();
      console.log(
        `✅ Created approved user: ${userData.companyName} (${userData.email})`
      );
    }

    // 4. Create Mock Rejected Users
    console.log("\n❌ Creating Mock Rejected Users...");
    const mockRejectedUsers = [
      {
        companyName: "Suspicious Company",
        email: "admin@suspiciouscompany.com",
        phone: "9876543230",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Uttar Pradesh",
        status: "rejected",
        rejectionReason:
          "Company information appears to be incomplete or suspicious",
      },
      {
        companyName: "Test Company",
        email: "test@testcompany.com",
        phone: "9876543231",
        phoneDialCode: "+91",
        phoneIso2: "IN",
        password: "password123",
        country: "India",
        state: "Bihar",
        status: "rejected",
        rejectionReason: "Test account - not a real business",
      },
    ];

    for (const userData of mockRejectedUsers) {
      const pendingUser = new PendingUser({
        companyName: userData.companyName,
        email: userData.email,
        phone: userData.phone,
        phoneDialCode: userData.phoneDialCode,
        phoneIso2: userData.phoneIso2,
        passwordHash: await bcrypt.hash(userData.password, 12),
        country: userData.country,
        state: userData.state,
        status: userData.status,
        rejectionReason: userData.rejectionReason,
        reviewedBy: (await Admin.findOne({ role: "admin" }))._id,
        reviewedAt: new Date(),
      });

      await pendingUser.save();
      console.log(
        `❌ Created rejected user: ${userData.companyName} (${userData.email})`
      );
    }

    // Display summary
    console.log("\n📊 Mock Data Summary:");
    console.log("====================");

    const adminCount = await Admin.countDocuments();
    const pendingCount = await PendingUser.countDocuments({
      status: "pending",
    });
    const approvedCount = await User.countDocuments({
      approvalStatus: "approved",
    });
    const rejectedCount = await PendingUser.countDocuments({
      status: "rejected",
    });

    console.log(`👥 Admins: ${adminCount}`);
    console.log(`⏳ Pending Users: ${pendingCount}`);
    console.log(`✅ Approved Users: ${approvedCount}`);
    console.log(`❌ Rejected Users: ${rejectedCount}`);

    console.log("\n🎉 Mock data created successfully!");
    console.log("\n📝 Admin Login Credentials:");
    console.log("==========================");
    console.log("Super Admin: superadmin@robobooks.com / super123");
    console.log("Admin: admin@robobooks.com / admin123");
    console.log("Moderator: moderator@robobooks.com / mod123");

    console.log("\n📝 User Login Credentials (Approved Users):");
    console.log("==========================================");
    console.log("Established Corp: admin@establishedcorp.com / password123");
    console.log(
      "Professional Services: manager@professionalservices.com / password123"
    );
    console.log(
      "Enterprise Solutions: ceo@enterprisesolutions.com / password123"
    );

    console.log("\n🔗 Quick Links:");
    console.log("==============");
    console.log("Admin Login: http://localhost:3000/admin/login");
    console.log("User Login: http://localhost:3000/signin");
    console.log("User Registration: http://localhost:3000/register");
  } catch (error) {
    console.error("❌ Error creating mock data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createMockData();
