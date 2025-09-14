import VendorCredit from "../models/VendorCredit.js";

// Create a new vendor credit
export const createVendorCredit = async (req, res) => {
  try {
    const vendorCredit = new VendorCredit(req.body);
    await vendorCredit.save();
    res.status(201).json({
      success: true,
      message: "Vendor credit created successfully",
      data: vendorCredit
    });
  } catch (error) {
    console.error("Error creating vendor credit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create vendor credit",
      error: error.message
    });
  }
};

// Get all vendor credits
export const getVendorCredits = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { credit_number: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (vendor_id) {
      query.vendor_id = vendor_id;
    }

    const vendorCredits = await VendorCredit.find(query)
      .populate('vendor_id', 'name email')
      .sort({ credit_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VendorCredit.countDocuments(query);

    res.json({
      success: true,
      data: vendorCredits,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching vendor credits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor credits",
      error: error.message
    });
  }
};

// Get vendor credit by ID
export const getVendorCreditById = async (req, res) => {
  try {
    const vendorCredit = await VendorCredit.findById(req.params.id)
      .populate('vendor_id', 'name email phone address');
    
    if (!vendorCredit) {
      return res.status(404).json({
        success: false,
        message: "Vendor credit not found"
      });
    }

    res.json({
      success: true,
      data: vendorCredit
    });
  } catch (error) {
    console.error("Error fetching vendor credit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor credit",
      error: error.message
    });
  }
};

// Update vendor credit
export const updateVendorCredit = async (req, res) => {
  try {
    const vendorCredit = await VendorCredit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendor_id', 'name email');

    if (!vendorCredit) {
      return res.status(404).json({
        success: false,
        message: "Vendor credit not found"
      });
    }

    res.json({
      success: true,
      message: "Vendor credit updated successfully",
      data: vendorCredit
    });
  } catch (error) {
    console.error("Error updating vendor credit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vendor credit",
      error: error.message
    });
  }
};

// Delete vendor credit
export const deleteVendorCredit = async (req, res) => {
  try {
    const vendorCredit = await VendorCredit.findByIdAndDelete(req.params.id);

    if (!vendorCredit) {
      return res.status(404).json({
        success: false,
        message: "Vendor credit not found"
      });
    }

    res.json({
      success: true,
      message: "Vendor credit deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting vendor credit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor credit",
      error: error.message
    });
  }
};
