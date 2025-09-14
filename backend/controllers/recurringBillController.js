import RecurringBill from "../models/RecurringBill.js";

// Create a new recurring bill
export const createRecurringBill = async (req, res) => {
  try {
    const recurringBill = new RecurringBill(req.body);
    await recurringBill.save();
    res.status(201).json({
      success: true,
      message: "Recurring bill created successfully",
      data: recurringBill
    });
  } catch (error) {
    console.error("Error creating recurring bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create recurring bill",
      error: error.message
    });
  }
};

// Get all recurring bills
export const getRecurringBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, frequency, is_active, vendor_id } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { bill_number: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (frequency) {
      query.frequency = frequency;
    }
    
    if (is_active !== undefined) {
      query.is_active = is_active === "true";
    }
    
    if (vendor_id) {
      query.vendor_id = vendor_id;
    }

    const recurringBills = await RecurringBill.find(query)
      .populate('vendor_id', 'name email')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RecurringBill.countDocuments(query);

    res.json({
      success: true,
      data: recurringBills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching recurring bills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring bills",
      error: error.message
    });
  }
};

// Get recurring bill by ID
export const getRecurringBillById = async (req, res) => {
  try {
    const recurringBill = await RecurringBill.findById(req.params.id)
      .populate('vendor_id', 'name email phone address');
    
    if (!recurringBill) {
      return res.status(404).json({
        success: false,
        message: "Recurring bill not found"
      });
    }

    res.json({
      success: true,
      data: recurringBill
    });
  } catch (error) {
    console.error("Error fetching recurring bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring bill",
      error: error.message
    });
  }
};

// Update recurring bill
export const updateRecurringBill = async (req, res) => {
  try {
    const recurringBill = await RecurringBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendor_id', 'name email');

    if (!recurringBill) {
      return res.status(404).json({
        success: false,
        message: "Recurring bill not found"
      });
    }

    res.json({
      success: true,
      message: "Recurring bill updated successfully",
      data: recurringBill
    });
  } catch (error) {
    console.error("Error updating recurring bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recurring bill",
      error: error.message
    });
  }
};

// Delete recurring bill
export const deleteRecurringBill = async (req, res) => {
  try {
    const recurringBill = await RecurringBill.findByIdAndDelete(req.params.id);

    if (!recurringBill) {
      return res.status(404).json({
        success: false,
        message: "Recurring bill not found"
      });
    }

    res.json({
      success: true,
      message: "Recurring bill deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting recurring bill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recurring bill",
      error: error.message
    });
  }
};
