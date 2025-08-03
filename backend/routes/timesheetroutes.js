import express from 'express';
import * as ctrl from '../controllers/timesheet.controller.js';
const router = express.Router();
router.post('/', ctrl.log);
router.get('/', ctrl.list);
export default router;
