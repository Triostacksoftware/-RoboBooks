import * as Svc from "../services/purchaseOrder.service.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";
import path from "path";
import fs from "fs";

// Create a new purchase order
export const createPurchaseOrder = async (req, res, next) => {
  try {
    const purchaseOrderData = {
      ...req.body,
      createdBy: req.user.id,
      organization: req.user.organization,
    };

    const purchaseOrder = await Svc.createPurchaseOrder(purchaseOrderData);
    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchaseOrder,
    });
  } catch (err) {
    next(err);
  }
};

// Get all purchase orders with filtering and pagination
export const listPurchaseOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      sortBy = "date",
      sortOrder = "desc",
      status,
      vendor,
      startDate,
      endDate,
      search,
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (vendor) filters.vendor = vendor;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { purchaseOrderNumber: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
        { customerNotes: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      organization: req.user.organization,
    };

    const result = await Svc.getAllPurchaseOrders(filters, options);
    res.json({
      success: true,
      data: result.purchaseOrders,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// Get purchase order by ID
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await Svc.getPurchaseOrderById(
      id,
      req.user.organization
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      data: purchaseOrder,
    });
  } catch (err) {
    next(err);
  }
};

// Update purchase order
export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await Svc.updatePurchaseOrder(
      id,
      req.body,
      req.user.organization
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      message: "Purchase order updated successfully",
      data: purchaseOrder,
    });
  } catch (err) {
    next(err);
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await Svc.deletePurchaseOrder(
      id,
      req.user.organization
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      message: "Purchase order deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const purchaseOrder = await Svc.updatePurchaseOrderStatus(
      id,
      status,
      req.user.organization
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      message: "Purchase order status updated successfully",
      data: purchaseOrder,
    });
  } catch (err) {
    next(err);
  }
};

// Convert purchase order to bill
export const convertToBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { billId } = req.body;

    const purchaseOrder = await Svc.convertToBill(
      id,
      billId,
      req.user.organization
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      message: "Purchase order converted to bill successfully",
      data: purchaseOrder,
    });
  } catch (err) {
    next(err);
  }
};

// Get purchase order statistics
export const getPurchaseOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate, vendor } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }
    if (vendor) filters.vendor = vendor;

    const stats = await Svc.getPurchaseOrderStats(
      req.user.organization,
      filters
    );
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

// Get purchase orders by vendor
export const getPurchaseOrdersByVendor = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const vendors = await Svc.getPurchaseOrdersByVendor(
      req.user.organization,
      filters
    );
    res.json({
      success: true,
      data: vendors,
    });
  } catch (err) {
    next(err);
  }
};

// Get pending purchase orders
export const getPendingPurchaseOrders = async (req, res, next) => {
  try {
    const purchaseOrders = await Svc.getPendingPurchaseOrders(
      req.user.organization
    );
    res.json({
      success: true,
      data: purchaseOrders,
    });
  } catch (err) {
    next(err);
  }
};

// Bulk update purchase orders
export const bulkUpdatePurchaseOrders = async (req, res, next) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase order IDs are required",
      });
    }

    const result = await Svc.bulkUpdatePurchaseOrders(
      ids,
      updateData,
      req.user.organization
    );
    res.json({
      success: true,
      message: `${result.modifiedCount} purchase orders updated successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    next(err);
  }
};

// Upload attachment
export const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const attachmentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const purchaseOrder = await Svc.getPurchaseOrderById(
      id,
      req.user.organization
    );
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    purchaseOrder.attachments.push(attachmentData);
    await purchaseOrder.save();

    res.json({
      success: true,
      message: "Attachment uploaded successfully",
      data: attachmentData,
    });
  } catch (err) {
    next(err);
  }
};

// Delete attachment
export const deleteAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;

    const purchaseOrder = await Svc.getPurchaseOrderById(
      id,
      req.user.organization
    );
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const attachment = purchaseOrder.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    attachment.remove();
    await purchaseOrder.save();

    res.json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Download attachment
export const downloadAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;

    const purchaseOrder = await Svc.getPurchaseOrderById(
      id,
      req.user.organization
    );
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const attachment = purchaseOrder.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    const filePath = path.join(process.cwd(), attachment.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filePath, attachment.originalName);
  } catch (err) {
    next(err);
  }
};

