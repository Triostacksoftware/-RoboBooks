import express from 'express';
import Joi from 'joi';
import { authGuard } from '../utils/jwt.js';
import validate from '../middlewares/validation.middleware.js';
import { 
  createVendor, 
  listVendors, 
  getVendorById, 
  updateVendor, 
  deleteVendor,
  searchVendors 
} from '../controllers/vendors.controller.js';

const router = express.Router();

// Apply authentication to all vendors routes
router.use(authGuard);

const vendorSchema = Joi.object({
  name: Joi.string().required(),
  gstin: Joi.string().required(),
  companyName: Joi.string().allow('').optional(),
  displayName: Joi.string().required(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  workPhone: Joi.string().allow('').optional(),
  mobile: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  contactInfo: Joi.string().allow('').optional(),
  type: Joi.string().valid('business', 'individual').optional(),
  salutation: Joi.string().optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  pan: Joi.string().allow('').optional(),
  msmeRegistered: Joi.boolean().optional(),
  currency: Joi.string().optional(),
  openingBalance: Joi.number().optional(),
  paymentTerms: Joi.string().optional(),
  tds: Joi.string().allow('').optional(),
  enablePortal: Joi.boolean().optional(),
  portalLanguage: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  contactPersons: Joi.array().items(Joi.object({
    name: Joi.string().allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    designation: Joi.string().allow('').optional()
  })).optional(),
  billingAddress: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).optional(),
  shippingAddress: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).optional(),
  payables: Joi.number().optional(),
  unusedCredits: Joi.number().optional()
});

const updateVendorSchema = Joi.object({
  name: Joi.string().optional(),
  gstin: Joi.string().optional(),
  companyName: Joi.string().allow('').optional(),
  displayName: Joi.string().optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  workPhone: Joi.string().allow('').optional(),
  mobile: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  contactInfo: Joi.string().allow('').optional(),
  type: Joi.string().valid('business', 'individual').optional(),
  salutation: Joi.string().optional(),
  firstName: Joi.string().allow('').optional(),
  lastName: Joi.string().allow('').optional(),
  pan: Joi.string().allow('').optional(),
  msmeRegistered: Joi.boolean().optional(),
  currency: Joi.string().optional(),
  openingBalance: Joi.number().optional(),
  paymentTerms: Joi.string().optional(),
  tds: Joi.string().allow('').optional(),
  enablePortal: Joi.boolean().optional(),
  portalLanguage: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  contactPersons: Joi.array().items(Joi.object({
    name: Joi.string().allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    designation: Joi.string().allow('').optional()
  })).optional(),
  billingAddress: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).optional(),
  shippingAddress: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).optional(),
  payables: Joi.number().optional(),
  unusedCredits: Joi.number().optional()
});

router.post('/', validate(vendorSchema), createVendor);
router.get('/', listVendors);
router.get('/search', searchVendors);
router.get('/:id', getVendorById);
router.put('/:id', validate(updateVendorSchema), updateVendor);
router.delete('/:id', deleteVendor);

export default router;
