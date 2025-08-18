import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function fixUserIndexes() {
  try {
    console.log("\n🔧 Fixing User model indexes...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const userCollection = db.collection("users");

    // Drop existing problematic indexes
    console.log("1. Dropping existing indexes...");
    try {
      await userCollection.dropIndex("phoneDialCode_1_phoneNumber_1");
      console.log("✅ Dropped phoneDialCode_1_phoneNumber_1 index");
    } catch (error) {
      console.log("ℹ️ phoneDialCode_1_phoneNumber_1 index doesn't exist");
    }

    try {
      await userCollection.dropIndex("phone_1");
      console.log("✅ Dropped phone_1 index");
    } catch (error) {
      console.log("ℹ️ phone_1 index doesn't exist");
    }

    try {
      await userCollection.dropIndex("email_1");
      console.log("✅ Dropped email_1 index");
    } catch (error) {
      console.log("ℹ️ email_1 index doesn't exist");
    }

    // Create new proper indexes
    console.log("\n2. Creating new indexes...");

    await userCollection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );
    console.log("✅ Created email index");

    await userCollection.createIndex(
      { phone: 1 },
      { unique: true, sparse: true }
    );
    console.log("✅ Created phone index");

    console.log("\n🎉 User indexes fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the fix
fixUserIndexes();
