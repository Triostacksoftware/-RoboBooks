import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

dotenv.config();

async function deepDebug() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check ALL users in both collections
    console.log("\n🔍 ALL Users in User collection:");
    const allUsers = await User.find({});
    console.log("Total users found:", allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive,
        companyName: user.companyName,
        createdAt: user.createdAt
      });
    });

    console.log("\n🔍 ALL Users in PendingUser collection:");
    const allPendingUsers = await PendingUser.find({});
    console.log("Total pending users found:", allPendingUsers.length);
    allPendingUsers.forEach((user, index) => {
      console.log(`Pending User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        status: user.status,
        companyName: user.companyName,
        createdAt: user.createdAt
      });
    });

    // Check specifically for test@example.com in both collections
    console.log("\n🔍 Specific search for test@example.com:");
    const userInUser = await User.findOne({ email: "test@example.com" });
    const userInPending = await PendingUser.findOne({ email: "test@example.com" });
    
    console.log("In User collection:", userInUser ? "FOUND" : "NOT FOUND");
    if (userInUser) {
      console.log("User details:", {
        id: userInUser._id,
        email: userInUser.email,
        approvalStatus: userInUser.approvalStatus,
        isActive: userInUser.isActive
      });
    }
    
    console.log("In PendingUser collection:", userInPending ? "FOUND" : "NOT FOUND");
    if (userInPending) {
      console.log("Pending user details:", {
        id: userInPending._id,
        email: userInPending.email,
        status: userInPending.status
      });
    }

    // Check if there are any users with similar emails
    console.log("\n🔍 Checking for similar emails:");
    const similarUsers = await User.find({ email: { $regex: "test", $options: "i" } });
    console.log("Similar users found:", similarUsers.length);
    similarUsers.forEach((user, index) => {
      console.log(`Similar User ${index + 1}:`, {
        id: user._id,
        email: user.email,
        approvalStatus: user.approvalStatus,
        isActive: user.isActive
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
deepDebug();


