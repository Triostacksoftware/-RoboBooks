import PurchaseOrder from "../models/PurchaseOrder.js";

// Create a new purchase order
export const createPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = new PurchaseOrder(req.body);
    await purchaseOrder.save();
    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
      error: error.message
    });
  }
};

// Get all purchase orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { po_number: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (vendor_id) {
      query.vendor_id = vendor_id;
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('vendor_id', 'name email')
      .populate('items.item_id', 'name description')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      success: true,
      data: purchaseOrders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
      error: error.message
    });
  }
};

// Get purchase order by ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendor_id', 'name email phone address')
      .populate('items.item_id', 'name description unit');
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    res.json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
      error: error.message
    });
  }
};

// Update purchase order
export const updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendor_id', 'name email')
     .populate('items.item_id', 'name description');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    res.json({
      success: true,
      message: "Purchase order updated successfully",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message
    });
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    res.json({
      success: true,
      message: "Purchase order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete purchase order",
      error: error.message
    });
  }
};

// Get purchase order statistics
export const getPurchaseOrderStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array to object with default values
    const statsObj = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      if (stat._id === "draft") statsObj.pending = stat.count;
      if (stat._id === "sent") statsObj.confirmed = stat.count;
      if (stat._id === "received") statsObj.completed = stat.count;
      if (stat._id === "cancelled") statsObj.cancelled = stat.count;
    });

    res.json({
      success: true,
      data: statsObj,
    });
  } catch (error) {
    console.error("Error fetching purchase order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching purchase order statistics",
      error: error.message,
    });
  }
};


