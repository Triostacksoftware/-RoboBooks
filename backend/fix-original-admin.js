import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const fixOriginalAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the original admin
    const admin = await Admin.findOne({ email: "admin@robobooks.com" });

    if (!admin) {
      console.log("Original admin not found");
      return;
    }

    console.log("Found admin:", admin.email);
    console.log(
      "Current passwordHash:",
      admin.passwordHash ? "exists" : "missing"
    );
    console.log(
      "Current password field:",
      admin.password ? "exists" : "missing"
    );

    // Ensure permissions include view_analytics
    if (!Array.isArray(admin.permissions)) {
      admin.permissions = [];
    }
    if (!admin.permissions.includes("view_analytics")) {
      admin.permissions.push("view_analytics");
      console.log("Added permission: view_analytics");
    }

    // Hash the password properly (idempotent)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    // Update the admin with proper password hash
    admin.passwordHash = hashedPassword;
    admin.password = undefined; // Remove plain text password

    await admin.save();

    console.log(
      "Admin updated successfully with permissions:",
      admin.permissions
    );

    // Test the password comparison
    const isPasswordValid = await admin.comparePassword("admin123");
    console.log(
      "Password comparison test:",
      isPasswordValid ? "SUCCESS" : "FAILED"
    );
  } catch (error) {
    console.error("Error fixing original admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixOriginalAdmin();
