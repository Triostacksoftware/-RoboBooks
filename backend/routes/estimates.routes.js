import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import {
  createEstimate,
  getEstimateById,
} from "../controllers/estimates.controller.js";

const router = express.Router();

// Apply authentication to all estimates routes
router.use(authGuard);

const estimateSchema = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().required(),
  customerEmail: Joi.string().email().optional(),
  customerPhone: Joi.string().optional(),
  customerAddress: Joi.string().optional(),
  
  // Buyer Details
  buyerName: Joi.string().optional(),
  buyerEmail: Joi.string().email().optional(),
  buyerPhone: Joi.string().optional(),
  buyerGstin: Joi.string().optional(),
  buyerAddress: Joi.string().optional(),
  
  // Seller Details
  sellerName: Joi.string().optional(),
  sellerEmail: Joi.string().email().optional(),
  sellerPhone: Joi.string().optional(),
  sellerGstin: Joi.string().optional(),
  sellerAddress: Joi.string().optional(),
  
  // Quote Details
  quoteNumber: Joi.string().optional(),
  quoteDate: Joi.date().optional(),
  validUntil: Joi.date().required(),
  subject: Joi.string().optional(),
  terms: Joi.string().optional(),
  
  // Items
  items: Joi.array().items(Joi.object({
    itemId: Joi.string().optional(),
    details: Joi.string().required(),
    description: Joi.string().optional(),
    quantity: Joi.number().default(1.0),
    unit: Joi.string().default("pcs"),
    rate: Joi.number().default(0.0),
    amount: Joi.number().default(0.0),
    taxMode: Joi.string().valid("GST", "IGST", "NON_TAXABLE", "NO_GST", "EXPORT").default("GST"),
    taxRate: Joi.number().default(0),
    taxAmount: Joi.number().default(0),
    cgst: Joi.number().default(0),
    sgst: Joi.number().default(0),
    igst: Joi.number().default(0),
    taxRemark: Joi.string().optional(),
  })).min(1).required(),
  
  // Summary
  subTotal: Joi.number().default(0.0),
  discount: Joi.number().default(0),
  discountType: Joi.string().valid("percentage", "amount").default("percentage"),
  discountAmount: Joi.number().default(0.0),
  taxType: Joi.string().default("GST"),
  taxRate: Joi.number().default(18),
  taxAmount: Joi.number().default(0.0),
  cgstTotal: Joi.number().default(0.0),
  sgstTotal: Joi.number().default(0.0),
  igstTotal: Joi.number().default(0.0),
  
  // TDS/TCS fields
  additionalTaxType: Joi.string().valid("TDS", "TCS", null).default(null),
  additionalTaxId: Joi.string().optional(),
  additionalTaxRate: Joi.number().default(0),
  additionalTaxAmount: Joi.number().default(0.0),
  
  adjustment: Joi.number().default(0.0),
  total: Joi.number().default(0.0),
  
  // Additional fields
  customerNotes: Joi.string().default("Thanks for your business."),
  termsConditions: Joi.string().optional(),
  internalNotes: Joi.string().optional(),
  files: Joi.array().items(Joi.string()).optional(),
  currency: Joi.string().default("INR"),
  
  // Address blocks
  billingAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().default("India"),
    zipCode: Joi.string().optional(),
  }).optional(),
  shippingAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().default("India"),
    zipCode: Joi.string().optional(),
  }).optional(),
  placeOfSupplyState: Joi.string().optional(),
  
  // Status
  status: Joi.string().valid("draft", "sent", "accepted", "rejected", "expired").default("draft")
});

router.post("/", validate(estimateSchema), createEstimate);
router.get("/:id", getEstimateById);

export default router;
