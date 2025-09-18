import Report from "../models/Report.js";
import Invoice from "../models/invoicemodel.js";
import Customer from "../models/Customer.js";
import Document from "../models/Document.js";

// Get all reports for a user
export const getReports = async (req, res) => {
  try {
    const { category, type, search, favorite } = req.query;
    const userId = req.user.uid;

    let query = { createdBy: userId };

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by type
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by favorite
    if (favorite === "true") {
      query.isFavorite = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// Get a single report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get report by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

// Create a new report
export const createReport = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      parameters,
      filters,
      isPublic,
      schedule,
    } = req.body;

    const userId = req.user.uid;

    const report = new Report({
      name,
      description,
      category,
      subCategory,
      parameters,
      filters,
      isPublic,
      schedule,
      createdBy: userId,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating report",
      error: error.message,
    });
  }
};

// Update a report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body;

    const report = await Report.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating report",
      error: error.message,
    });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const report = await Report.findOneAndDelete({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting report",
      error: error.message,
    });
  }
};

// Generate report data
export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { filters } = req.body;
    const userId = req.user.uid;

    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Apply filters
    const appliedFilters = { ...report.filters, ...filters };

    let reportData = {};

    switch (report.category) {
      case "business_overview":
        reportData = await generateBusinessOverviewReport(appliedFilters, userId);
        break;
      case "sales":
        reportData = await generateSalesReport(appliedFilters, userId);
        break;
      case "purchases_expenses":
        reportData = await generatePurchasesExpensesReport(appliedFilters, userId);
        break;
      case "accounting":
        reportData = await generateAccountingReport(appliedFilters, userId);
        break;
      default:
        reportData = { message: "Report type not implemented yet" };
    }

    // Update last run time
    await Report.findByIdAndUpdate(id, { lastRun: new Date() });

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating report",
      error: error.message,
    });
  }
};

// Toggle favorite status
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.isFavorite = !report.isFavorite;
    await report.save();

    res.json({
      success: true,
      message: `Report ${report.isFavorite ? "added to" : "removed from"} favorites`,
      data: report,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating favorite status",
      error: error.message,
    });
  }
};

// Helper functions for report generation
async function generateBusinessOverviewReport(filters, userId) {
  const dateFilter = {};
  if (filters.dateRange?.start && filters.dateRange?.end) {
    dateFilter.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end),
    };
  }

  const [totalInvoices, totalCustomers, totalRevenue, recentActivity] = await Promise.all([
    Invoice.countDocuments({ createdBy: userId, ...dateFilter }),
    Customer.countDocuments({ createdBy: userId }),
    Invoice.aggregate([
      { $match: { createdBy: userId, status: "paid", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Invoice.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email"),
  ]);

  return {
    summary: {
      totalInvoices,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    recentActivity,
  };
}

async function generateSalesReport(filters, userId) {
  const dateFilter = {};
  if (filters.dateRange?.start && filters.dateRange?.end) {
    dateFilter.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end),
    };
  }

  const salesData = await Invoice.aggregate([
    { $match: { createdBy: userId, ...dateFilter } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const customerSales = await Invoice.aggregate([
    { $match: { createdBy: userId, ...dateFilter } },
    {
      $group: {
        _id: "$customer",
        totalSales: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  return {
    salesData,
    customerSales,
  };
}

async function generatePurchasesExpensesReport(filters, userId) {
  // This would typically involve purchase orders and expense tracking
  // For now, returning placeholder data
  return {
    message: "Purchases and expenses report - to be implemented with purchase order system",
  };
}

async function generateAccountingReport(filters, userId) {
  // This would involve more complex accounting data
  // For now, returning placeholder data
  return {
    message: "Accounting report - to be implemented with full accounting system",
  };
}


