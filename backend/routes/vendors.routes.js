import express from 'express';
import Joi from 'joi';
import { authGuard } from '../utils/jwt.js';
import validate from '../middlewares/validation.middleware.js';
import { createVendor, listVendors, getVendorById } from '../controllers/vendors.controller.js';

const router = express.Router();

// Apply authentication to all vendors routes
router.use(authGuard);

const vendorSchema = Joi.object({
  name:        Joi.string().required(),
  gstin:       Joi.string().required(),
  address:     Joi.string().allow('').optional(),
  contactInfo: Joi.string().allow('').optional()
});

router.post('/',   validate(vendorSchema), createVendor);
router.get('/',    listVendors);
router.get('/:id', getVendorById);

export default router;
