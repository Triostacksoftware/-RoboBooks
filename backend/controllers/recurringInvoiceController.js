import RecurringInvoice from "../models/RecurringInvoice.js";
import Invoice from "../models/invoicemodel.js";

// Get all recurring invoices
export const getAll = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { profileName: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [recurringInvoices, total] = await Promise.all([
      RecurringInvoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("customerId", "firstName lastName email"),
      RecurringInvoice.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: recurringInvoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching recurring invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring invoices",
    });
  }
};

// Get recurring invoice by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recurringInvoice = await RecurringInvoice.findById(id)
      .populate("customerId", "firstName lastName email phone address")
      .populate("generatedInvoices", "invoiceNumber invoiceDate total status");
    
    if (!recurringInvoice) {
      return res.status(404).json({
        success: false,
        message: "Recurring invoice not found",
      });
    }
    
    res.json({
      success: true,
      data: recurringInvoice,
    });
  } catch (error) {
    console.error("Error fetching recurring invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring invoice",
    });
  }
};

// Create new recurring invoice
export const create = async (req, res) => {
  try {
    const {
      profileName,
      frequency,
      startDate,
      endDate,
      neverExpires,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerGstin,
      buyerAddress,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerGstin,
      sellerAddress,
      orderNumber,
      terms,
      salesperson,
      subject,
      project,
      items,
      subTotal,
      discount,
      discountType,
      discountAmount,
      taxAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      additionalTaxType,
      additionalTaxId,
      additionalTaxRate,
      additionalTaxAmount,
      adjustment,
      total,
      paymentTerms,
      paymentMethod,
      customerNotes,
      termsConditions,
      internalNotes,
    } = req.body;

    // Calculate next generation date
    const nextGenerationDate = calculateNextGenerationDate(startDate, frequency);

    const recurringInvoice = new RecurringInvoice({
      profileName,
      frequency,
      startDate: new Date(startDate),
      endDate: neverExpires ? null : new Date(endDate),
      neverExpires,
      nextGenerationDate,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerGstin,
      buyerAddress,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerGstin,
      sellerAddress,
      orderNumber,
      terms,
      salesperson,
      subject,
      project,
      items: items || [],
      subTotal: subTotal || 0,
      discount: discount || 0,
      discountType,
      discountAmount: discountAmount || 0,
      taxAmount: taxAmount || 0,
      cgstTotal: cgstTotal || 0,
      sgstTotal: sgstTotal || 0,
      igstTotal: igstTotal || 0,
      additionalTaxType,
      additionalTaxId,
      additionalTaxRate: additionalTaxRate || 0,
      additionalTaxAmount: additionalTaxAmount || 0,
      adjustment: adjustment || 0,
      total: total || 0,
      paymentTerms,
      paymentMethod,
      customerNotes,
      termsConditions,
      internalNotes,
      createdBy: req.user?.id || null,
    });

    const savedRecurringInvoice = await recurringInvoice.save();
    
    res.status(201).json({
      success: true,
      data: savedRecurringInvoice,
      message: "Recurring invoice created successfully",
    });
  } catch (error) {
    console.error("Error creating recurring invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create recurring invoice",
    });
  }
};

// Update recurring invoice
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If frequency or start date changed, recalculate next generation date
    if (updateData.frequency || updateData.startDate) {
      const current = await RecurringInvoice.findById(id);
      const newStartDate = updateData.startDate || current.startDate;
      const newFrequency = updateData.frequency || current.frequency;
      updateData.nextGenerationDate = calculateNextGenerationDate(newStartDate, newFrequency);
    }
    
    updateData.updatedBy = req.user?.id || null;
    
    const updatedRecurringInvoice = await RecurringInvoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("customerId", "firstName lastName email");
    
    if (!updatedRecurringInvoice) {
      return res.status(404).json({
        success: false,
        message: "Recurring invoice not found",
      });
    }
    
    res.json({
      success: true,
      data: updatedRecurringInvoice,
      message: "Recurring invoice updated successfully",
    });
  } catch (error) {
    console.error("Error updating recurring invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recurring invoice",
    });
  }
};

// Delete recurring invoice
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRecurringInvoice = await RecurringInvoice.findByIdAndDelete(id);
    
    if (!deletedRecurringInvoice) {
      return res.status(404).json({
        success: false,
        message: "Recurring invoice not found",
      });
    }
    
    res.json({
      success: true,
      message: "Recurring invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recurring invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recurring invoice",
    });
  }
};

// Update status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["active", "paused", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    
    const updateData = { status, updatedBy: req.user?.id || null };
    
    // If status is completed, set isActive to false
    if (status === "completed") {
      updateData.isActive = false;
    }
    
    const updatedRecurringInvoice = await RecurringInvoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedRecurringInvoice) {
      return res.status(404).json({
        success: false,
        message: "Recurring invoice not found",
      });
    }
    
    res.json({
      success: true,
      data: updatedRecurringInvoice,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

// Get generated invoices for a recurring invoice
export const getGeneratedInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const recurringInvoice = await RecurringInvoice.findById(id);
    if (!recurringInvoice) {
      return res.status(404).json({
        success: false,
        message: "Recurring invoice not found",
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [invoices, total] = await Promise.all([
      Invoice.find({ _id: { $in: recurringInvoice.generatedInvoices } })
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments({ _id: { $in: recurringInvoice.generatedInvoices } }),
    ]);
    
    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching generated invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch generated invoices",
    });
  }
};

// Helper function to calculate next generation date
function calculateNextGenerationDate(startDate, frequency) {
  const date = new Date(startDate);
  
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date;
}
