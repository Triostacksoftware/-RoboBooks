import * as SalesOrderService from "../services/salesOrderService.js";

export async function create(req, res) {
  try {
    // Handle both JSON and FormData requests
    let salesOrderData;
    if (req.body.salesOrderData) {
      // FormData request - parse the JSON string
      salesOrderData = JSON.parse(req.body.salesOrderData);
    } else {
      // Regular JSON request
      salesOrderData = req.body;
    }

    // Add files to sales order data if they exist
    if (req.files && req.files.length > 0) {
      salesOrderData.files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
    }

    const salesOrder = await SalesOrderService.createSalesOrder(salesOrderData);
    res.status(201).json({
      success: true,
      data: salesOrder,
      message: "Sales order created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getAll(req, res) {
  try {
    const salesOrders = await SalesOrderService.getAllSalesOrders();
    res.status(200).json({
      success: true,
      data: salesOrders,
      message: "Sales orders retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getById(req, res) {
  try {
    const salesOrder = await SalesOrderService.getSalesOrderById(req.params.id);
    res.status(200).json({
      success: true,
      data: salesOrder,
      message: "Sales order retrieved successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

export async function update(req, res) {
  try {
    const salesOrder = await SalesOrderService.updateSalesOrder(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: salesOrder,
      message: "Sales order updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function remove(req, res) {
  try {
    const result = await SalesOrderService.deleteSalesOrder(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const salesOrder = await SalesOrderService.updateSalesOrderStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      data: salesOrder,
      message: "Sales order status updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getNextSalesOrderNumber(req, res) {
  try {
    const result = await SalesOrderService.getNextSalesOrderNumber();
    res.status(200).json({
      success: true,
      data: result,
      message: "Next sales order number retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function sendSalesOrderEmail(req, res) {
  try {
    const result = await SalesOrderService.sendSalesOrderEmail(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Sales order email sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
