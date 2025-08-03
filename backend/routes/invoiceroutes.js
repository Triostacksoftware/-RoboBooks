import express from 'express';
import * as ctrl from '../controllers/invoice.controller.js';
const router = express.Router();
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
export default router;
