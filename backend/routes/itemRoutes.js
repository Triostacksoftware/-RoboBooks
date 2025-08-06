import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  hardDeleteItem,
  getItemsByType,
  getLowStockItems,
  searchItems,
  getItemStats
} from '../controllers/itemController.js';

const router = express.Router();

// Create a new item
router.post('/', createItem);

// Get all items with pagination and filtering
router.get('/', getAllItems);

// Get item statistics
router.get('/stats', getItemStats);

// Search items
router.get('/search', searchItems);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get items by type (goods or services)
router.get('/type/:type', getItemsByType);

// Get item by ID
router.get('/:id', getItemById);

// Update item by ID
router.put('/:id', updateItem);

// Patch item by ID (partial update)
router.patch('/:id', updateItem);

// Soft delete item by ID
router.delete('/:id', deleteItem);

// Hard delete item by ID (admin only)
router.delete('/:id/permanent', hardDeleteItem);

export default router; 