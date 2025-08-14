import UserModulePreference from "../models/UserModulePreference.js";

// Get user's module preferences
const getUserModulePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await UserModulePreference.find({ userId });

    // Create a map of module preferences
    const modulePreferences = {};
    preferences.forEach((pref) => {
      modulePreferences[pref.moduleName] = pref.isEnabled;
    });

    // Define all available modules with default values
    const allModules = [
      {
        name: "home",
        label: "Home",
        description: "Dashboard overview and main navigation",
      },
      {
        name: "items",
        label: "Items",
        description: "Manage your products and services",
      },
      {
        name: "customers",
        label: "Customers",
        description: "Manage customer information and relationships",
      },
      {
        name: "sales",
        label: "Sales",
        description: "Invoices, quotes, and sales management",
      },
      {
        name: "purchases",
        label: "Purchases",
        description: "Purchase orders and vendor management",
      },
      {
        name: "banking",
        label: "Banking",
        description: "Bank accounts and transactions",
      },
      {
        name: "time",
        label: "Time Tracking",
        description: "Track time for projects and tasks",
      },
      {
        name: "accountant",
        label: "Accountant",
        description: "Accounting and financial management",
      },
      {
        name: "reports",
        label: "Reports",
        description: "Analytics and business reports",
      },
      {
        name: "documents",
        label: "Documents",
        description: "Document management and storage",
      },
      {
        name: "vendors",
        label: "Vendors",
        description: "Manage vendor relationships",
      },
      {
        name: "payroll",
        label: "Payroll",
        description: "Employee payroll management",
      },
      {
        name: "help-support",
        label: "Help & Support",
        description: "Get help and support",
      },
      {
        name: "configure",
        label: "Configure Features",
        description: "Configure system settings",
      },
    ];

    // Merge with user preferences
    const modulesWithPreferences = allModules.map((module) => ({
      ...module,
      isEnabled:
        modulePreferences[module.name] !== undefined
          ? modulePreferences[module.name]
          : true,
    }));

    res.json({
      success: true,
      data: modulesWithPreferences,
    });
  } catch (error) {
    console.error("Error getting user module preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get module preferences",
      error: error.message,
    });
  }
};

// Save user's module preferences
const saveUserModulePreferences = async (req, res) => {
  try {
    // Get user ID from authentication or request body
    let userId = req.user?.id;

    // If no authenticated user, try to get from request body
    if (!userId && req.body.userId) {
      userId = req.body.userId;
    }

    // If still no user ID, try to get from session
    if (!userId && req.session?.userId) {
      userId = req.session.userId;
    }

    // If still no user ID, return error
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required. Please log in or provide user ID.",
      });
    }
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: "Preferences array is required",
      });
    }

    // Prepare bulk operations
    const bulkOps = preferences.map((pref) => ({
      updateOne: {
        filter: { userId, moduleName: pref.name },
        update: { $set: { isEnabled: pref.isEnabled } },
        upsert: true,
      },
    }));

    // Execute bulk operations
    await UserModulePreference.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: "Module preferences saved successfully",
    });
  } catch (error) {
    console.error("Error saving user module preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save module preferences",
      error: error.message,
    });
  }
};

export { getUserModulePreferences, saveUserModulePreferences };
