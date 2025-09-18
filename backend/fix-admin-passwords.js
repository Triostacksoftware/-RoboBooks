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

async function fixAdminPasswords() {
  try {
    console.log("🔧 Fixing admin passwords...");

    // Find all admins
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin accounts`);

    let fixedCount = 0;

    for (const admin of admins) {
      // Check if admin has a valid password hash
      if (!admin.passwordHash || admin.passwordHash.trim() === '') {
        console.log(`⚠️  Admin ${admin.email} has no password hash. Setting default password...`);
        
        // Set default password based on role
        let defaultPassword = "admin123";
        if (admin.role === "super_admin") {
          defaultPassword = "admin123";
        } else if (admin.role === "admin") {
          defaultPassword = "manager123";
        } else if (admin.role === "moderator") {
          defaultPassword = "analyst123";
        }

        // Hash the default password
        admin.passwordHash = await bcrypt.hash(defaultPassword, 12);
        await admin.save();

        console.log(`✅ Fixed password for ${admin.email} (${admin.role})`);
        console.log(`   Default password: ${defaultPassword}`);
        fixedCount++;
      } else {
        console.log(`✅ Admin ${admin.email} has valid password hash`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`Total admins: ${admins.length}`);
    console.log(`Fixed passwords: ${fixedCount}`);
    console.log(`Already valid: ${admins.length - fixedCount}`);

    if (fixedCount > 0) {
      console.log(`\n🔐 Default passwords set:`);
      console.log(`Super Admin: admin123`);
      console.log(`Admin: manager123`);
      console.log(`Moderator: analyst123`);
      console.log(`\n⚠️  Please change these passwords after first login!`);
    }

  } catch (error) {
    console.error("❌ Error fixing admin passwords:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Starting admin password fix...");
    
    // Connect to database
    await connectDB();
    
    // Fix admin passwords
    await fixAdminPasswords();
    
    console.log("\n✅ Admin password fix completed successfully!");
    
  } catch (error) {
    console.error("❌ Admin password fix failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run fix if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixAdminPasswords };


