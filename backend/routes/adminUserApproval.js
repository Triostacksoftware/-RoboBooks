import express from "express";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import { authGuard } from "../utils/jwt.js";
import { adminAuthGuard } from "../middleware/adminAuth.js";

const router = express.Router();

// Get all pending user registrations
router.get("/pending-users", adminAuthGuard, async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .select("-passwordHash");

    res.json({
      success: true,
      pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users with approval status
router.get("/users", adminAuthGuard, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.approvalStatus = status;
    }

    const users = await User.find(query)
      .populate("approvedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-passwordHash");

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Approve a pending user registration
router.post(
  "/approve-user/:pendingUserId",
  adminAuthGuard,
  async (req, res) => {
    try {
      const { pendingUserId } = req.params;
      const { rejectionReason } = req.body;

      const pendingUser = await PendingUser.findById(pendingUserId);

      if (!pendingUser) {
        return res.status(404).json({ message: "Pending user not found" });
      }

      if (pendingUser.status !== "pending") {
        return res
          .status(400)
          .json({ message: "User is not in pending status" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: pendingUser.email }, { phone: pendingUser.phone }],
      });

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

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
        approvalStatus: "approved",
        approvedBy: req.user.uid,
        approvedAt: new Date(),
      });

      // Update pending user status
      pendingUser.status = "approved";
      pendingUser.reviewedBy = req.user.uid;
      pendingUser.reviewedAt = new Date();
      await pendingUser.save();

      console.log(
        `✅ User approved: ${newUser.email} by admin: ${req.user.email}`
      );

      res.json({
        success: true,
        message: "User approved successfully",
        user: {
          id: newUser._id,
          companyName: newUser.companyName,
          email: newUser.email,
          phone: newUser.phone,
          approvalStatus: newUser.approvalStatus,
        },
      });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Reject a pending user registration
router.post("/reject-user/:pendingUserId", adminAuthGuard, async (req, res) => {
  try {
    const { pendingUserId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const pendingUser = await PendingUser.findById(pendingUserId);

    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    if (pendingUser.status !== "pending") {
      return res.status(400).json({ message: "User is not in pending status" });
    }

    // Update pending user status
    pendingUser.status = "rejected";
    pendingUser.rejectionReason = rejectionReason.trim();
    pendingUser.reviewedBy = req.user.uid;
    pendingUser.reviewedAt = new Date();
    await pendingUser.save();

    console.log(
      `❌ User rejected: ${pendingUser.email} by admin: ${req.user.email}`
    );

    res.json({
      success: true,
      message: "User rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user approval status (for existing users)
router.patch(
  "/update-user-status/:userId",
  adminAuthGuard,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { approvalStatus, rejectionReason } = req.body;

      if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
        return res.status(400).json({ message: "Invalid approval status" });
      }

      if (approvalStatus === "rejected" && !rejectionReason?.trim()) {
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.approvalStatus = approvalStatus;

      if (approvalStatus === "approved") {
        user.approvedBy = req.user.uid;
        user.approvedAt = new Date();
        user.rejectionReason = undefined;
      } else if (approvalStatus === "rejected") {
        user.rejectionReason = rejectionReason.trim();
        user.approvedBy = undefined;
        user.approvedAt = undefined;
      }

      await user.save();

      console.log(
        `🔄 User status updated: ${user.email} to ${approvalStatus} by admin: ${req.user.email}`
      );

      res.json({
        success: true,
        message: "User status updated successfully",
        user: {
          id: user._id,
          companyName: user.companyName,
          email: user.email,
          approvalStatus: user.approvalStatus,
        },
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get approval statistics
router.get("/approval-stats", adminAuthGuard, async (req, res) => {
  try {
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      PendingUser.countDocuments({ status: "pending" }),
      User.countDocuments({ approvalStatus: "approved" }),
      User.countDocuments({ approvalStatus: "rejected" }),
    ]);

    const totalPendingUsers = await PendingUser.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      stats: {
        pendingApprovals: pendingCount,
        approvedUsers: approvedCount,
        rejectedUsers: rejectedCount,
        totalPendingUsers,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching approval stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;


