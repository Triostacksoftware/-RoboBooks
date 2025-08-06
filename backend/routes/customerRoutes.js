import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  hardDeleteCustomer,
  getCustomersByType,
  searchCustomers,
  getCustomerStats
} from '../controllers/customerController.js';

const router = express.Router();

// Create a new customer
router.post('/', createCustomer);

// Get all customers with pagination and filtering
router.get('/', getAllCustomers);

// Get customer statistics
router.get('/stats', getCustomerStats);

// Search customers
router.get('/search', searchCustomers);

// Get customers by type (business or individual)
router.get('/type/:type', getCustomersByType);

// Get customer by ID
router.get('/:id', getCustomerById);

// Update customer by ID
router.put('/:id', updateCustomer);

// Patch customer by ID (partial update)
router.patch('/:id', updateCustomer);

// Soft delete customer by ID
router.delete('/:id', deleteCustomer);

// Hard delete customer by ID (admin only)
router.delete('/:id/permanent', hardDeleteCustomer);

export default router; 