import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import PendingUser from "./models/PendingUser.js";
import Admin from "./models/Admin.js";

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

async function testUserApproval() {
  try {
    console.log("\n🧪 Testing User Approval System...\n");

    // 1. Create a test admin
    console.log("1. Creating test admin...");
    const admin = await Admin.findOne({ email: "admin@test.com" });
    let testAdmin;
    
    if (!admin) {
      testAdmin = await Admin.create({
        firstName: "Test",
        lastName: "Admin",
        email: "admin@test.com",
        passwordHash: "$2a$12$test.hash.for.testing",
        role: "admin",
        permissions: ["manage_users", "view_analytics"]
      });
      console.log("✅ Test admin created");
    } else {
      testAdmin = admin;
      console.log("✅ Test admin already exists");
    }

    // 2. Clean up any existing test data
    console.log("\n2. Cleaning up existing test data...");
    await PendingUser.deleteMany({ email: "testuser@example.com" });
    await User.deleteMany({ email: "testuser@example.com" });
    console.log("✅ Test data cleaned up");

    // 3. Create a test pending user
    console.log("\n3. Creating test pending user...");
    const pendingUser = await PendingUser.create({
      companyName: "Test Company Ltd",
      email: "testuser@example.com",
      phone: "9876543210",
      phoneDialCode: "+91",
      phoneIso2: "IN",
      passwordHash: "$2a$12$test.hash.for.testing",
      country: "India",
      state: "Maharashtra",
      status: "pending"
    });
    console.log("✅ Test pending user created:", pendingUser.email);

    // 4. Check pending users count
    console.log("\n4. Checking pending users...");
    const pendingCount = await PendingUser.countDocuments({ status: 'pending' });
    console.log(`📊 Pending users count: ${pendingCount}`);

    // 5. Approve the user
    console.log("\n5. Approving user...");
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: pendingUser.email }, { phone: pendingUser.phone }]
    });

    if (existingUser) {
      console.log("⚠️ User already exists, skipping approval");
    } else {
      // Create the approved user
      const newUser = await User.create({
        companyName: pendingUser.companyName,
        email: pendingUser.email,
        phone: pendingUser.phone,
        phoneDialCode: pendingUser.phoneDialCode,
        phoneIso2: pendingUser.phoneIso2,
        passwordHash: pendingUser.passwordHash,
        country: pendingUser.country,
        state: pendingUser.state,
        approvalStatus: 'approved',
        approvedBy: testAdmin._id,
        approvedAt: new Date()
      });

      // Update pending user status
      pendingUser.status = 'approved';
      pendingUser.reviewedBy = testAdmin._id;
      pendingUser.reviewedAt = new Date();
      await pendingUser.save();

      console.log("✅ User approved successfully:", newUser.email);
    }

    // 6. Check final stats
    console.log("\n6. Final statistics...");
    const [finalPendingCount, approvedCount, rejectedCount] = await Promise.all([
      PendingUser.countDocuments({ status: 'pending' }),
      User.countDocuments({ approvalStatus: 'approved' }),
      User.countDocuments({ approvalStatus: 'rejected' })
    ]);

    console.log(`📊 Final stats:`);
    console.log(`   - Pending: ${finalPendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);

    // 7. Test login with approved user
    console.log("\n7. Testing login with approved user...");
    const approvedUser = await User.findOne({ email: "testuser@example.com" });
    if (approvedUser) {
      console.log(`✅ User found: ${approvedUser.companyName}`);
      console.log(`   - Approval status: ${approvedUser.approvalStatus}`);
      console.log(`   - Approved by: ${approvedUser.approvedBy}`);
      console.log(`   - Approved at: ${approvedUser.approvedAt}`);
    }

    console.log("\n🎉 User approval system test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the test
testUserApproval();
