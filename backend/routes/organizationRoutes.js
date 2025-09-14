import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as organizationController from '../controllers/organizationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Organization routes
router.get('/', organizationController.getOrganizations);
router.get('/active', organizationController.getActiveOrganization);
router.get('/:id', organizationController.getOrganizationById);
router.post('/', organizationController.createOrganization);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);
router.post('/:id/activate', organizationController.setActiveOrganization);

export default router;
