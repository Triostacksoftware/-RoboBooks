import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

dotenv.config();

async function checkAllUsers() {
  try {
    // Connect to MongoDB using the SAME method as the backend server
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB || "robobooks";
    
    console.log("🔍 Connecting to MongoDB using backend server method:");
    console.log("MongoDB URI:", mongoUri);
    console.log("Database Name:", dbName);
    
    await mongoose.connect(mongoUri, {
      dbName: dbName
    });
    console.log("✅ Connected to MongoDB");

    // Check ALL users in both collections
    console.log("\n🔍 ALL Users in User collection:");
    const allUsers = await User.find({});
    console.log("Total users found:", allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        phone: user.phone,
        phoneDialCode: user.phoneDialCode,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        companyName: user.companyName
      });
    });

    console.log("\n🔍 ALL Users in PendingUser collection:");
    const allPendingUsers = await PendingUser.find({});
    console.log("Total pending users found:", allPendingUsers.length);
    allPendingUsers.forEach((user, index) => {
      console.log(`Pending User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        phone: user.phone,
        phoneDialCode: user.phoneDialCode,
        status: user.status,
        companyName: user.companyName
      });
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkAllUsers();


