import RecurringExpense from "../models/RecurringExpense.js";

// Create a new recurring expense
export const createRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = new RecurringExpense(req.body);
    await recurringExpense.save();
    res.status(201).json({
      success: true,
      message: "Recurring expense created successfully",
      data: recurringExpense
    });
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create recurring expense",
      error: error.message
    });
  }
};

// Get all recurring expenses
export const getRecurringExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, frequency, is_active } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    
    if (frequency) {
      query.frequency = frequency;
    }
    
    if (is_active !== undefined) {
      query.is_active = is_active === "true";
    }

    const recurringExpenses = await RecurringExpense.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RecurringExpense.countDocuments(query);

    res.json({
      success: true,
      data: recurringExpenses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring expenses",
      error: error.message
    });
  }
};

// Get recurring expense by ID
export const getRecurringExpenseById = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findById(req.params.id);
    
    if (!recurringExpense) {
      return res.status(404).json({
        success: false,
        message: "Recurring expense not found"
      });
    }

    res.json({
      success: true,
      data: recurringExpense
    });
  } catch (error) {
    console.error("Error fetching recurring expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring expense",
      error: error.message
    });
  }
};

// Update recurring expense
export const updateRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!recurringExpense) {
      return res.status(404).json({
        success: false,
        message: "Recurring expense not found"
      });
    }

    res.json({
      success: true,
      message: "Recurring expense updated successfully",
      data: recurringExpense
    });
  } catch (error) {
    console.error("Error updating recurring expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recurring expense",
      error: error.message
    });
  }
};

// Delete recurring expense
export const deleteRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findByIdAndDelete(req.params.id);

    if (!recurringExpense) {
      return res.status(404).json({
        success: false,
        message: "Recurring expense not found"
      });
    }

    res.json({
      success: true,
      message: "Recurring expense deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recurring expense",
      error: error.message
    });
  }
};
