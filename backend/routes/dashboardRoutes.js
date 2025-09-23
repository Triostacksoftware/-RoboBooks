import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import authGuard from '../middleware/auth.js';

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/stats', authGuard, dashboardController.getDashboardStats);

// Real-time dashboard updates via Server-Sent Events
router.get('/events', dashboardController.getDashboardEvents);

export default router;


