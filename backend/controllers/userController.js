import User from "../models/User.js";

// Get all users for admin panel
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        phoneDialCode: user.phoneDialCode,
        phoneIso2: user.phoneIso2,
        country: user.country,
        state: user.state,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        providers: user.providers
      }))
    });
  } catch (err) {
    console.error("Get all users error:", err);
    next(err);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        phoneDialCode: user.phoneDialCode,
        phoneIso2: user.phoneIso2,
        country: user.country,
        state: user.state,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        providers: user.providers
      }
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    next(err);
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        phoneDialCode: user.phoneDialCode,
        phoneIso2: user.phoneIso2,
        country: user.country,
        state: user.state,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        providers: user.providers
      }
    });
  } catch (err) {
    console.error("Update user status error:", err);
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("Delete user error:", err);
    next(err);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsers
      }
    });
  } catch (err) {
    console.error("Get user stats error:", err);
    next(err);
  }
};
