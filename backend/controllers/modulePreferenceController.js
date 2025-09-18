import UserModulePreference from "../models/UserModulePreference.js";
import jwt from "jsonwebtoken";

// Get user's module preferences
const getUserModulePreferences = async (req, res) => {
  try {
    // Get user ID from JWT token (rb_session cookie)
    let userId = null;

    // Try to get user ID from JWT token in cookies
    if (req.cookies && req.cookies.rb_session) {
      try {
        const decoded = jwt.verify(
          req.cookies.rb_session,
          process.env.JWT_SECRET || "fallback-secret-key"
        );
        userId = decoded.uid; // JWT token mein uid field hai
        console.log("✅ User ID extracted from JWT for GET:", userId);
      } catch (e) {
        console.warn("Could not verify JWT token for GET:", e.message);
      }
    }

    // If no user ID, return default preferences
    if (!userId) {
      console.log("⚠️ No user ID found, returning default preferences");
      // Return default preferences (all enabled)
      const allModules = [
        {
          name: "home",
          label: "Home",
          description: "Dashboard overview and main navigation",
          isEnabled: true,
        },
        {
          name: "items",
          label: "Items",
          description: "Manage your products and services",
          isEnabled: true,
        },

        {
          name: "sales",
          label: "Sales",
          description: "Invoices, quotes, and sales management",
          isEnabled: true,
        },
        {
          name: "purchases",
          label: "Purchases",
          description: "Purchase orders and vendor management",
          isEnabled: true,
        },
        {
          name: "banking",
          label: "Banking",
          description: "Bank accounts and transactions",
          isEnabled: true,
        },
        {
          name: "time",
          label: "Time Tracking",
          description: "Track time for projects and tasks",
          isEnabled: true,
        },
        {
          name: "accountant",
          label: "Accountant",
          description: "Accounting and financial management",
          isEnabled: true,
        },
        {
          name: "reports",
          label: "Reports",
          description: "Analytics and business reports",
          isEnabled: true,
        },
        {
          name: "documents",
          label: "Documents",
          description: "Document management and storage",
          isEnabled: true,
        },

        {
          name: "help-support",
          label: "Help & Support",
          description: "Get help and support",
          isEnabled: true,
        },
        {
          name: "configure",
          label: "Configure Features",
          description: "Configure system settings",
          isEnabled: true,
        },
      ];

      return res.json({
        success: true,
        data: allModules,
      });
    }

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
    // Get user ID from JWT token (rb_session cookie)
    let userId = null;

    // Try to get user ID from JWT token in cookies
    if (req.cookies && req.cookies.rb_session) {
      try {
        const decoded = jwt.verify(
          req.cookies.rb_session,
          process.env.JWT_SECRET || "fallback-secret-key"
        );
        userId = decoded.uid; // JWT token mein uid field hai
        console.log("✅ User ID extracted from JWT:", userId);
      } catch (e) {
        console.warn("Could not verify JWT token:", e.message);
      }
    }

    // If still no user ID, return error
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in session. Please log in again.",
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


