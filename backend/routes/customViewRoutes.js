import express from 'express';
import auth from '../middleware/auth.js';
import {
  getCustomViews,
  getCustomView,
  createCustomView,
  updateCustomView,
  deleteCustomView,
  applyCustomView
} from '../controllers/customViewController.js';

const router = express.Router();

// Get all custom views for a module
router.get('/:module', auth, getCustomViews);

// Get a specific custom view
router.get('/:module/:id', auth, getCustomView);

// Create a new custom view
router.post('/:module', auth, createCustomView);

// Update a custom view
router.put('/:module/:id', auth, updateCustomView);

// Delete a custom view
router.delete('/:module/:id', auth, deleteCustomView);

// Apply custom view filters and get data
router.post('/:module/apply', auth, applyCustomView);

export default router;
