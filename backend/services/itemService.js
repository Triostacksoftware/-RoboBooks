import Item from '../models/Item.js';

class ItemService {
  // Create a new item with business logic
  static async createItem(itemData, userId) {
    try {
      // Auto-generate SKU if not provided
      if (!itemData.sku) {
        const prefix = itemData.type === 'Goods' ? 'GDS' : 'SRV';
        const timestamp = Date.now().toString().slice(-6);
        itemData.sku = `${prefix}-${timestamp}`;
      }

      // Set default values
      itemData.createdBy = userId;
      itemData.isActive = true;

      // Convert string numbers to actual numbers
      if (itemData.sellingPrice) itemData.sellingPrice = parseFloat(itemData.sellingPrice);
      if (itemData.costPrice) itemData.costPrice = parseFloat(itemData.costPrice);
      if (itemData.currentStock) itemData.currentStock = parseInt(itemData.currentStock);
      if (itemData.reorderPoint) itemData.reorderPoint = parseInt(itemData.reorderPoint);
      if (itemData.gstRate) itemData.gstRate = parseFloat(itemData.gstRate);

      const newItem = new Item(itemData);
      const savedItem = await newItem.save();

      return {
        success: true,
        data: savedItem
      };
    } catch (error) {
      throw error;
    }
  }

  // Get items with advanced filtering
  static async getItems(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        category,
        isActive = true,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build filter object
      const filter = { isActive };
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ];
      }

      if (type) filter.type = type;
      if (category) filter.category = category;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const items = await Item.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const totalItems = await Item.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        success: true,
        data: items,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get item by ID with population
  static async getItemById(id) {
    try {
      const item = await Item.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!item) {
        throw new Error('Item not found');
      }

      return {
        success: true,
        data: item
      };
    } catch (error) {
      throw error;
    }
  }

  // Update item with validation
  static async updateItem(id, updateData, userId) {
    try {
      // Find the item first
      const existingItem = await Item.findById(id);
      if (!existingItem) {
        throw new Error('Item not found');
      }

      // Add updatedBy field
      updateData.updatedBy = userId;

      // Convert string numbers to actual numbers
      if (updateData.sellingPrice) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
      if (updateData.costPrice) updateData.costPrice = parseFloat(updateData.costPrice);
      if (updateData.currentStock) updateData.currentStock = parseInt(updateData.currentStock);
      if (updateData.reorderPoint) updateData.reorderPoint = parseInt(updateData.reorderPoint);
      if (updateData.gstRate) updateData.gstRate = parseFloat(updateData.gstRate);

      const updatedItem = await Item.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email')
       .populate('updatedBy', 'name email');

      return {
        success: true,
        data: updatedItem
      };
    } catch (error) {
      throw error;
    }
  }

  // Soft delete item
  static async deleteItem(id, userId) {
    try {
      const item = await Item.findById(id);
      if (!item) {
        throw new Error('Item not found');
      }

      item.isActive = false;
      item.updatedBy = userId;
      await item.save();

      return {
        success: true,
        message: 'Item deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get item statistics
  static async getItemStats() {
    try {
      const totalItems = await Item.countDocuments({ isActive: true });
      const goodsCount = await Item.countDocuments({ type: 'Goods', isActive: true });
      const servicesCount = await Item.countDocuments({ type: 'Service', isActive: true });
      const lowStockCount = await Item.countDocuments({
        $expr: { $lte: ['$currentStock', '$reorderPoint'] },
        isActive: true
      });

      // Get category distribution
      const categoryStats = await Item.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get price statistics
      const priceStats = await Item.aggregate([
        { $match: { isActive: true, sellingPrice: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avgSellingPrice: { $avg: '$sellingPrice' },
            minSellingPrice: { $min: '$sellingPrice' },
            maxSellingPrice: { $max: '$sellingPrice' },
            totalValue: { $sum: { $multiply: ['$sellingPrice', '$currentStock'] } }
          }
        }
      ]);

      return {
        total: totalItems,
        goods: goodsCount,
        services: servicesCount,
        lowStock: lowStockCount,
        categoryStats,
        priceStats: priceStats[0] || {}
      };
    } catch (error) {
      throw error;
    }
  }

  // Get low stock items
  static async getLowStockItems(pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const items = await Item.findLowStock()
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limitNum)
        .sort({ currentStock: 1 });

      const totalItems = await Item.countDocuments({
        $expr: { $lte: ['$currentStock', '$reorderPoint'] },
        isActive: true
      });

      return {
        success: true,
        data: items,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems,
          itemsPerPage: limitNum
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Search items with advanced filtering
  static async searchItems(searchParams = {}, pagination = {}) {
    try {
      const { q, type, category } = searchParams;
      const { page = 1, limit = 10 } = pagination;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const filter = { isActive: true };

      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
          { barcode: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      if (type) filter.type = type;
      if (category) filter.category = category;

      const items = await Item.find(filter)
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const totalItems = await Item.countDocuments(filter);

      return {
        success: true,
        data: items,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems,
          itemsPerPage: limitNum
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate item data
  static validateItemData(itemData) {
    const errors = [];

    if (!itemData.name || itemData.name.trim() === '') {
      errors.push('Name is required');
    }

    if (itemData.type === 'Goods' && (!itemData.hsnCode || itemData.hsnCode.trim() === '')) {
      errors.push('HSN code is required for goods');
    }

    if (itemData.type === 'Service' && (!itemData.sacCode || itemData.sacCode.trim() === '')) {
      errors.push('SAC code is required for services');
    }

    if (itemData.salesEnabled && (!itemData.sellingPrice || parseFloat(itemData.sellingPrice) <= 0)) {
      errors.push('Selling price is required when sales is enabled');
    }

    if (itemData.purchaseEnabled && (!itemData.costPrice || parseFloat(itemData.costPrice) <= 0)) {
      errors.push('Cost price is required when purchase is enabled');
    }

    return errors;
  }

  // Check for duplicate items
  static async checkDuplicates(itemData, excludeId = null) {
    const duplicates = [];

    // Check name
    const nameFilter = { name: { $regex: new RegExp(`^${itemData.name}?`, 'i') }, isActive: true };
    if (excludeId) nameFilter._id = { $ne: excludeId };
    
    const existingName = await Item.findOne(nameFilter);
    if (existingName) {
      duplicates.push('An item with this name already exists');
    }

    // Check SKU if provided
    if (itemData.sku) {
      const skuFilter = { sku: itemData.sku, isActive: true };
      if (excludeId) skuFilter._id = { $ne: excludeId };
      
      const existingSku = await Item.findOne(skuFilter);
      if (existingSku) {
        duplicates.push('An item with this SKU already exists');
      }
    }

    // Check barcode if provided
    if (itemData.barcode) {
      const barcodeFilter = { barcode: itemData.barcode, isActive: true };
      if (excludeId) barcodeFilter._id = { $ne: excludeId };
      
      const existingBarcode = await Item.findOne(barcodeFilter);
      if (existingBarcode) {
        duplicates.push('An item with this barcode already exists');
      }
    }

    return duplicates;
  }
}

export default ItemService;

// Export static methods for dashboard
export const getItemStats = ItemService.getItemStats; 


