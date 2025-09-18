import * as DeliveryChallanService from "../services/deliveryChallanService.js";

export async function create(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const deliveryChallan = await DeliveryChallanService.createDeliveryChallan(
      req.body,
      userId
    );

    res.status(201).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan created successfully",
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
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status,
      dateFrom,
      dateTo,
      customerId,
    } = req.query;

    const filters = { status, dateFrom, dateTo, customerId };
    const pagination = { page, limit, sortBy, sortOrder, search };

    const result = await DeliveryChallanService.getAllDeliveryChallans(
      filters,
      pagination
    );

    res.status(200).json({
      success: true,
      data: {
        deliveryChallans: result.deliveryChallans,
        pagination: result.pagination,
      },
      message: "Delivery Challans retrieved successfully",
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
    const deliveryChallan = await DeliveryChallanService.getDeliveryChallanById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan retrieved successfully",
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
    const userId = req.user?.id || req.body.userId;
    const deliveryChallan = await DeliveryChallanService.updateDeliveryChallan(
      req.params.id,
      req.body,
      userId
    );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan updated successfully",
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
    const userId = req.user?.id || req.body.userId;
    const result = await DeliveryChallanService.deleteDeliveryChallan(
      req.params.id,
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Delivery Challan deleted successfully",
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
    const userId = req.user?.id || req.body.userId;
    const { status, notes } = req.body;

    const deliveryChallan =
      await DeliveryChallanService.updateDeliveryChallanStatus(
        req.params.id,
        status,
        userId,
        notes
      );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan status updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function openChallan(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const { notes } = req.body;

    const deliveryChallan =
      await DeliveryChallanService.updateDeliveryChallanStatus(
        req.params.id,
        "Open",
        userId,
        notes || "Challan opened and dispatched"
      );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan opened successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function markDelivered(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const { notes } = req.body;

    const deliveryChallan =
      await DeliveryChallanService.updateDeliveryChallanStatus(
        req.params.id,
        "Delivered",
        userId,
        notes || "Challan delivered successfully"
      );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan marked as delivered",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function markReturned(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const { partialReturn, returnedItems, notes } = req.body;

    const deliveryChallan =
      await DeliveryChallanService.markDeliveryChallanReturned(
        req.params.id,
        { partialReturn, returnedItems, notes },
        userId
      );

    res.status(200).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan marked as returned",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function sendEmail(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const { to, cc, subject, message } = req.body;

    const result = await DeliveryChallanService.sendDeliveryChallanEmail(
      req.params.id,
      { to, cc, subject, message },
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Delivery Challan email sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function duplicate(req, res) {
  try {
    const userId = req.user?.id || req.body.userId;
    const deliveryChallan =
      await DeliveryChallanService.duplicateDeliveryChallan(
        req.params.id,
        userId
      );

    res.status(201).json({
      success: true,
      data: deliveryChallan,
      message: "Delivery Challan duplicated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getNextChallanNumber(req, res) {
  try {
    const { orgId, fy, numberingSeries } = req.query;

    if (!orgId || !fy) {
      return res.status(400).json({
        success: false,
        error: "Organization ID and Financial Year are required",
      });
    }

    const nextNumber = await DeliveryChallanService.getNextChallanNumber(
      orgId,
      fy,
      numberingSeries || "DC"
    );

    res.status(200).json({
      success: true,
      data: { nextChallanNumber: nextNumber },
      message: "Next challan number retrieved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}


