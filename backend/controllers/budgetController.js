import Budget from "../models/Budget.js";

// Create a new budget
export const createBudget = async (req, res) => {
  try {
    console.log("🔍 Creating budget:", req.body);
    
    const budgetData = {
      ...req.body,
      createdBy: req.user.uid
    };

    const budget = new Budget(budgetData);
    await budget.save();

    console.log("✅ Budget created:", budget.name);
    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: budget
    });
  } catch (error) {
    console.error("❌ Error creating budget:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all budgets with pagination and filters
export const getBudgets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, fiscalYear, budgetType, search } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (fiscalYear) filter.fiscalYear = fiscalYear;
    if (budgetType) filter.budgetType = budgetType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const budgets = await Budget.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Budget.countDocuments(filter);

    console.log(`✅ Retrieved ${budgets.length} budgets`);
    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching budgets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets"
    });
  }
};

// Get a single budget by ID
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    console.log("✅ Retrieved budget:", budget.name);
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error("❌ Error fetching budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget"
    });
  }
};

// Update a budget
export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    // Only allow updates if budget is in draft status
    if (budget.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Cannot update active or completed budget"
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log("✅ Updated budget:", updatedBudget.name);
    res.json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget
    });
  } catch (error) {
    console.error("❌ Error updating budget:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Activate a budget
export const activateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    if (budget.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Budget is already active or completed"
      });
    }

    budget.status = 'active';
    budget.approvedBy = req.user.uid;
    budget.approvedAt = new Date();
    
    await budget.save();

    console.log("✅ Activated budget:", budget.name);
    res.json({
      success: true,
      message: "Budget activated successfully",
      data: budget
    });
  } catch (error) {
    console.error("❌ Error activating budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate budget"
    });
  }
};

// Delete a budget
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    if (budget.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete active or completed budget"
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    console.log("✅ Deleted budget:", budget.name);
    res.json({
      success: true,
      message: "Budget deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete budget"
    });
  }
};

// Get budget statistics
export const getBudgetStats = async (req, res) => {
  try {
    const stats = await Budget.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBudgeted: { $sum: "$totalBudgeted" },
          totalActual: { $sum: "$totalActual" },
          totalVariance: { $sum: "$totalVariance" }
        }
      }
    ]);

    const totalStats = await Budget.aggregate([
      {
        $group: {
          _id: null,
          totalBudgets: { $sum: 1 },
          totalBudgeted: { $sum: "$totalBudgeted" },
          totalActual: { $sum: "$totalActual" },
          totalVariance: { $sum: "$totalVariance" }
        }
      }
    ]);

    console.log("✅ Retrieved budget statistics");
    res.json({
      success: true,
      data: {
        byStatus: stats,
        totals: totalStats[0] || { 
          totalBudgets: 0, 
          totalBudgeted: 0, 
          totalActual: 0, 
          totalVariance: 0 
        }
      }
    });
  } catch (error) {
    console.error("❌ Error fetching budget statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget statistics"
    });
  }
};

// Update actual amounts for budget items
export const updateBudgetActuals = async (req, res) => {
  try {
    const { budgetId, itemUpdates } = req.body;
    
    const budget = await Budget.findById(budgetId);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    // Update actual amounts for specified items
    itemUpdates.forEach(update => {
      const item = budget.items.id(update.itemId);
      if (item) {
        item.actualAmount = update.actualAmount;
      }
    });

    await budget.save();

    console.log("✅ Updated budget actuals:", budget.name);
    res.json({
      success: true,
      message: "Budget actuals updated successfully",
      data: budget
    });
  } catch (error) {
    console.error("❌ Error updating budget actuals:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


