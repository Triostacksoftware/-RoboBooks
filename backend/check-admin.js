import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const checkAdmin = async () => {
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

    console.log("Admin found:", {
      email: admin.email,
      passwordHash: admin.passwordHash
        ? `exists (${admin.passwordHash.length} chars)`
        : "missing",
      password: admin.password ? "exists" : "missing",
      isActive: admin.isActive,
      role: admin.role,
    });

    // Test password comparison
    try {
      const isPasswordValid = await admin.comparePassword("admin123");
      console.log("Password comparison result:", isPasswordValid);
    } catch (error) {
      console.log("Password comparison error:", error.message);
    }
  } catch (error) {
    console.error("Error checking admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

checkAdmin();
