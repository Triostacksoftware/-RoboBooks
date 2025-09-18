import PaymentMade from "../models/PaymentMade.js";

// Create a new payment made
export const createPaymentMade = async (req, res) => {
  try {
    const paymentMade = new PaymentMade(req.body);
    await paymentMade.save();
    res.status(201).json({
      success: true,
      message: "Payment made created successfully",
      data: paymentMade
    });
  } catch (error) {
    console.error("Error creating payment made:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment made",
      error: error.message
    });
  }
};

// Get all payments made
export const getPaymentsMade = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, payment_method, status, vendor_id } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { reference_number: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }
    
    if (payment_method) {
      query.payment_method = payment_method;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (vendor_id) {
      query.vendor_id = vendor_id;
    }

    const paymentsMade = await PaymentMade.find(query)
      .populate('vendor_id', 'name email')
      .populate('bill_id', 'bill_number total')
      .sort({ payment_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PaymentMade.countDocuments(query);

    res.json({
      success: true,
      data: paymentsMade,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching payments made:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments made",
      error: error.message
    });
  }
};

// Get payment made by ID
export const getPaymentMadeById = async (req, res) => {
  try {
    const paymentMade = await PaymentMade.findById(req.params.id)
      .populate('vendor_id', 'name email phone address')
      .populate('bill_id', 'bill_number total due_date');
    
    if (!paymentMade) {
      return res.status(404).json({
        success: false,
        message: "Payment made not found"
      });
    }

    res.json({
      success: true,
      data: paymentMade
    });
  } catch (error) {
    console.error("Error fetching payment made:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment made",
      error: error.message
    });
  }
};

// Update payment made
export const updatePaymentMade = async (req, res) => {
  try {
    const paymentMade = await PaymentMade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendor_id', 'name email')
     .populate('bill_id', 'bill_number total');

    if (!paymentMade) {
      return res.status(404).json({
        success: false,
        message: "Payment made not found"
      });
    }

    res.json({
      success: true,
      message: "Payment made updated successfully",
      data: paymentMade
    });
  } catch (error) {
    console.error("Error updating payment made:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment made",
      error: error.message
    });
  }
};

// Delete payment made
export const deletePaymentMade = async (req, res) => {
  try {
    const paymentMade = await PaymentMade.findByIdAndDelete(req.params.id);

    if (!paymentMade) {
      return res.status(404).json({
        success: false,
        message: "Payment made not found"
      });
    }

    res.json({
      success: true,
      message: "Payment made deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting payment made:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment made",
      error: error.message
    });
  }
};


