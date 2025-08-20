import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

dotenv.config();

async function cleanAllAndCreate() {
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

    // Clean up ALL users in both collections
    console.log("🗑️ Cleaning up ALL users...");
    const userDeleteResult = await User.deleteMany({});
    const pendingDeleteResult = await PendingUser.deleteMany({});
    
    console.log("Deleted from User collection:", userDeleteResult.deletedCount);
    console.log("Deleted from PendingUser collection:", pendingDeleteResult.deletedCount);

    // Hash password
    const passwordHash = await bcrypt.hash("password123", 12);

    // Create new test user in User collection (approved)
    const testUser = await User.create({
      companyName: "Test Company",
      email: "test@example.com",
      phone: "1234567890",
      phoneDialCode: "+91",
      phoneIso2: "IN",
      passwordHash: passwordHash,
      country: "India",
      state: "Karnataka",
      isActive: true,
      approvalStatus: "approved",
      approvedAt: new Date()
    });

    console.log("✅ Test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    console.log("Company: Test Company");
    console.log("Status: Approved");
    console.log("User ID:", testUser._id);
    console.log("Collection: User (approved)");

    // Verify the user exists
    const createdUser = await User.findOne({ email: "test@example.com" });
    if (createdUser) {
      console.log("✅ Verification: User found in User collection");
      console.log("Approval Status:", createdUser.approvalStatus);
      console.log("Is Active:", createdUser.isActive);
      console.log("Phone:", createdUser.phone);
    }

    // Check total users
    const totalUsers = await User.countDocuments({});
    const totalPending = await PendingUser.countDocuments({});
    console.log("Total users in User collection:", totalUsers);
    console.log("Total users in PendingUser collection:", totalPending);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
cleanAllAndCreate();
