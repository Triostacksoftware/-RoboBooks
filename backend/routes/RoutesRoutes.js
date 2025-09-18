import express from "express";
import multer from "multer";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import {
  createEstimate,
  getEstimateById,
  getAllEstimates,
  updateEstimate,
  deleteEstimate,
  updateEstimateStatus,
  getNextEstimateNumber,
} from "../controllers/estimates.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Apply authentication to all quotes routes
router.use(authGuard);

const quoteSchema = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().required(),
  customerEmail: Joi.string().email(),
  customerPhone: Joi.string(),
  customerAddress: Joi.string(),
  buyerName: Joi.string(),
  buyerEmail: Joi.string().email(),
  buyerPhone: Joi.string(),
  buyerGstin: Joi.string(),
  buyerAddress: Joi.string(),
  sellerName: Joi.string(),
  sellerEmail: Joi.string().email(),
  sellerPhone: Joi.string(),
  sellerGstin: Joi.string(),
  sellerAddress: Joi.string(),
  quoteNumber: Joi.string().required(),
  quoteDate: Joi.date().required(),
  validUntil: Joi.date().required(),
  subject: Joi.string(),
  terms: Joi.string(),
  items: Joi.array().items(Joi.object({
    itemId: Joi.string(),
    details: Joi.string().required(),
    description: Joi.string(),
    quantity: Joi.number().required(),
    unit: Joi.string(),
    rate: Joi.number().required(),
    amount: Joi.number().required(),
    taxMode: Joi.string(),
    taxRate: Joi.number(),
    taxAmount: Joi.number(),
    cgst: Joi.number(),
    sgst: Joi.number(),
    igst: Joi.number(),
    taxRemark: Joi.string(),
  })),
  subTotal: Joi.number(),
  discount: Joi.number(),
  discountType: Joi.string(),
  discountAmount: Joi.number(),
  taxType: Joi.string(),
  taxRate: Joi.number(),
  taxAmount: Joi.number(),
  cgstTotal: Joi.number(),
  sgstTotal: Joi.number(),
  igstTotal: Joi.number(),
  additionalTaxType: Joi.string(),
  additionalTaxId: Joi.string(),
  additionalTaxRate: Joi.number(),
  additionalTaxAmount: Joi.number(),
  adjustment: Joi.number(),
  total: Joi.number().required(),
  status: Joi.string().valid("draft", "sent", "accepted", "rejected", "expired").default("draft"),
  customerNotes: Joi.string(),
  termsConditions: Joi.string(),
  internalNotes: Joi.string(),
  files: Joi.array(),
  currency: Joi.string().default("INR"),
  billingAddress: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    zipCode: Joi.string(),
  }),
  shippingAddress: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    zipCode: Joi.string(),
  }),
  placeOfSupplyState: Joi.string(),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid("draft", "sent", "accepted", "rejected", "expired").required(),
});

// GET /api/quotes - Get all quotes
router.get("/", getAllEstimates);

// GET /api/quotes/next-number - Get next quote number
router.get("/next-number", getNextEstimateNumber);

// GET /api/quotes/:id - Get quote by ID
router.get("/:id", getEstimateById);

// POST /api/quotes - Create new quote
router.post("/", upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'signature', maxCount: 1 }
]), createEstimate);

// PUT /api/quotes/:id - Update quote
router.put("/:id", validate(quoteSchema), updateEstimate);

// PATCH /api/quotes/:id/status - Update quote status
router.patch("/:id/status", validate(statusUpdateSchema), updateEstimateStatus);

// DELETE /api/quotes/:id - Delete quote
router.delete("/:id", deleteEstimate);

export default router;


