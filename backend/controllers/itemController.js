import Item from "../models/Item.js";

// Create a new item
export const createItem = async (req, res) => {
  try {
    const {
      type,
      name,
      unit,
      hsnCode,
      sacCode,
      salesEnabled,
      purchaseEnabled,
      sellingPrice,
      costPrice,
      salesAccount,
      purchaseAccount,
      salesDescription,
      purchaseDescription,
      preferredVendor,
      description,
      intraGST,
      interGST,
      category,
      brand,
      currentStock,
      reorderPoint,
      gstRate,
      sku,
      barcode,
    } = req.body;

    // Validate required fields based on type
    if (type === "Goods" && !hsnCode) {
      return res.status(400).json({
        success: false,
        message: "HSN code is required for goods",
      });
    }

    if (type === "Service" && !sacCode) {
      return res.status(400).json({
        success: false,
        message: "SAC code is required for services",
      });
    }

    // Check if item with same name already exists
    const existingItem = await Item.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isActive: true,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "An item with this name already exists",
      });
    }

    // Check for unique SKU if provided
    if (sku) {
      const existingSku = await Item.findOne({ sku, isActive: true });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists",
        });
      }
    }

    // Check for unique barcode if provided
    if (barcode) {
      const existingBarcode = await Item.findOne({ barcode, isActive: true });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: "An item with this barcode already exists",
        });
      }
    }

    const itemData = {
      type,
      name,
      unit,
      hsnCode,
      sacCode,
      salesEnabled,
      purchaseEnabled,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
      costPrice: costPrice ? parseFloat(costPrice) : undefined,
      salesAccount,
      purchaseAccount,
      salesDescription,
      purchaseDescription,
      preferredVendor,
      description,
      intraGST,
      interGST,
      category,
      brand,
      currentStock: currentStock ? parseInt(currentStock) : 0,
      reorderPoint: reorderPoint ? parseInt(reorderPoint) : 0,
      gstRate: gstRate ? parseFloat(gstRate) : 18,
      sku,
      barcode,
      createdBy: req.user?.id || null,
    };

    const newItem = new Item(itemData);
    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: savedItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    });
  }
};

// Get all items with pagination and filtering
export const getAllItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const items = await Item.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching item:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    });
  }
};

// Update item by ID
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the item first
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check for name uniqueness if name is being updated
    if (updateData.name && updateData.name !== existingItem.name) {
      const nameExists = await Item.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        isActive: true,
        _id: { $ne: id },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "An item with this name already exists",
        });
      }
    }

    // Check for SKU uniqueness if SKU is being updated
    if (updateData.sku && updateData.sku !== existingItem.sku) {
      const skuExists = await Item.findOne({
        sku: updateData.sku,
        isActive: true,
        _id: { $ne: id },
      });

      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists",
        });
      }
    }

    // Check for barcode uniqueness if barcode is being updated
    if (updateData.barcode && updateData.barcode !== existingItem.barcode) {
      const barcodeExists = await Item.findOne({
        barcode: updateData.barcode,
        isActive: true,
        _id: { $ne: id },
      });

      if (barcodeExists) {
        return res.status(400).json({
          success: false,
          message: "An item with this barcode already exists",
        });
      }
    }

    // Convert string numbers to actual numbers
    if (updateData.sellingPrice)
      updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    if (updateData.costPrice)
      updateData.costPrice = parseFloat(updateData.costPrice);
    if (updateData.currentStock)
      updateData.currentStock = parseInt(updateData.currentStock);
    if (updateData.reorderPoint)
      updateData.reorderPoint = parseInt(updateData.reorderPoint);
    if (updateData.gstRate) updateData.gstRate = parseFloat(updateData.gstRate);

    // Add updatedBy field
    updateData.updatedBy = req.user?.id || null;

    const updatedItem = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

// Delete item by ID (soft delete)
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Soft delete by setting isActive to false
    item.isActive = false;
    item.updatedBy = req.user?.id || null;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

// Hard delete item by ID
export const hardDeleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item permanently deleted",
    });
  } catch (error) {
    console.error("Error hard deleting item:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

// Get items by type
export const getItemsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const items = await Item.findByType(type)
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments({ type, isActive: true });

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching items by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items by type",
      error: error.message,
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const items = await Item.findLowStock()
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limitNum)
      .sort({ currentStock: 1 });

    const totalItems = await Item.countDocuments({
      $expr: { $lte: ["$currentStock", "$reorderPoint"] },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock items",
      error: error.message,
    });
  }
};

// Search items
export const searchItems = async (req, res) => {
  try {
    const { q, type, category } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isActive: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { barcode: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (type) filter.type = type;
    if (category) filter.category = category;

    const items = await Item.find(filter)
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalItems = await Item.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error searching items:", error);
    res.status(500).json({
      success: false,
      message: "Error searching items",
      error: error.message,
    });
  }
};

// Get item statistics
export const getItemStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ isActive: true });
    const goodsCount = await Item.countDocuments({
      type: "Goods",
      isActive: true,
    });
    const servicesCount = await Item.countDocuments({
      type: "Service",
      isActive: true,
    });
    const lowStockCount = await Item.countDocuments({
      $expr: { $lte: ["$currentStock", "$reorderPoint"] },
      isActive: true,
    });

    // Get category distribution
    const categoryStats = await Item.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        goodsCount,
        servicesCount,
        lowStockCount,
        categoryStats,
      },
    });
  } catch (error) {
    console.error("Error fetching item statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching item statistics",
      error: error.message,
    });
  }
};


