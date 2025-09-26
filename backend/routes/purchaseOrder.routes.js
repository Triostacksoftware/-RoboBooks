import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";
import {
  createPurchaseOrder,
  listPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  convertToBill,
  getPurchaseOrderStats,
  getPurchaseOrdersByVendor,
  getPendingPurchaseOrders,
  bulkUpdatePurchaseOrders,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
} from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

// Apply authentication to all purchase order routes
router.use(authGuard);

// Validation schemas
const itemSchema = Joi.object({
  item: Joi.string().required(),
  description: Joi.string().optional(),
  account: Joi.string().required(),
  quantity: Joi.number().min(0).required(),
  rate: Joi.number().min(0).required(),
  amount: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  tax: Joi.string().optional(),
  taxAmount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().min(0).required(),
});

const deliveryAddressSchema = Joi.object({
  type: Joi.string().valid("organization", "customer").default("organization"),
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
});

const createPurchaseOrderSchema = Joi.object({
  purchaseOrderNumber: Joi.string().optional(),
  referenceNumber: Joi.string().optional(),
  date: Joi.date().required(),
  deliveryDate: Joi.date().optional(),
  vendor: Joi.string().required(),
  deliveryAddress: deliveryAddressSchema.required(),
  shipmentPreference: Joi.string().optional(),
  paymentTerms: Joi.string().default("Due on Receipt"),
  items: Joi.array().items(itemSchema).min(1).required(),
  subTotal: Joi.number().min(0).required(),
  discount: Joi.object({
    type: Joi.string().valid("percentage", "amount").default("percentage"),
    value: Joi.number().min(0).default(0),
    amount: Joi.number().min(0).default(0),
  }).optional(),
  tax: Joi.object({
    type: Joi.string().valid("TDS", "TCS").default("TDS"),
    taxId: Joi.string().optional(),
    amount: Joi.number().min(0).default(0),
  }).optional(),
  adjustment: Joi.number().default(0),
  totalAmount: Joi.number().min(0).required(),
  customerNotes: Joi.string().optional(),
  termsAndConditions: Joi.string().optional(),
});

const updatePurchaseOrderSchema = Joi.object({
  purchaseOrderNumber: Joi.string().optional(),
  referenceNumber: Joi.string().optional(),
  date: Joi.date().optional(),
  deliveryDate: Joi.date().optional(),
  vendor: Joi.string().optional(),
  deliveryAddress: deliveryAddressSchema.optional(),
  shipmentPreference: Joi.string().optional(),
  paymentTerms: Joi.string().optional(),
  items: Joi.array().items(itemSchema).min(1).optional(),
  subTotal: Joi.number().min(0).optional(),
  discount: Joi.object({
    type: Joi.string().valid("percentage", "amount").default("percentage"),
    value: Joi.number().min(0).default(0),
    amount: Joi.number().min(0).default(0),
  }).optional(),
  tax: Joi.object({
    type: Joi.string().valid("TDS", "TCS").default("TDS"),
    taxId: Joi.string().optional(),
    amount: Joi.number().min(0).default(0),
  }).optional(),
  adjustment: Joi.number().optional(),
  totalAmount: Joi.number().min(0).optional(),
  customerNotes: Joi.string().optional(),
  termsAndConditions: Joi.string().optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "draft",
      "sent",
      "acknowledged",
      "partially_received",
      "received",
      "closed",
      "cancelled"
    )
    .required(),
});

const convertToBillSchema = Joi.object({
  billId: Joi.string().required(),
});

const bulkUpdateSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).required(),
  updateData: Joi.object().required(),
});

// Routes
router.post("/", validate(createPurchaseOrderSchema), createPurchaseOrder);
router.get("/", listPurchaseOrders);
router.get("/stats", getPurchaseOrderStats);
router.get("/by-vendor", getPurchaseOrdersByVendor);
router.get("/pending", getPendingPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.put("/:id", validate(updatePurchaseOrderSchema), updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  updatePurchaseOrderStatus
);
router.patch(
  "/:id/convert-to-bill",
  validate(convertToBillSchema),
  convertToBill
);
router.patch(
  "/bulk-update",
  validate(bulkUpdateSchema),
  bulkUpdatePurchaseOrders
);

// Attachment routes
router.post(
  "/:id/attachments",
  upload.single("attachment"),
  handleUploadError,
  uploadAttachment
);
router.delete("/:id/attachments/:attachmentId", deleteAttachment);
router.get("/:id/attachments/:attachmentId/download", downloadAttachment);

export default router;


