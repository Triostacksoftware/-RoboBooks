import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createPurchaseOrder, 
  getPurchaseOrders, 
  getPurchaseOrderById, 
  updatePurchaseOrder, 
  deletePurchaseOrder,
  getPurchaseOrderStats
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

// Apply authentication to all purchase order routes
router.use(authGuard);

const purchaseOrderSchema = Joi.object({
  vendor_id: Joi.string().required(),
  po_number: Joi.string().required(),
  order_date: Joi.date().required(),
  expected_delivery_date: Joi.date().optional(),
  items: Joi.array().items(Joi.object({
    item_id: Joi.string().allow(null, '').optional(),
    item_name: Joi.string().allow(null, '').optional(),
    description: Joi.string().allow(null, '').optional(),
    quantity: Joi.number().min(1).required(),
    unit_price: Joi.number().min(0).required(),
    tax_rate: Joi.number().min(0).default(0),
    total: Joi.number().min(0).required()
  }).custom((value, helpers) => {
    // Either item_id or item_name must be provided
    if ((!value.item_id || value.item_id === '') && (!value.item_name || value.item_name === '')) {
      return helpers.error('custom.itemRequired');
    }
    return value;
  }).messages({
    'custom.itemRequired': 'Either item_id or item_name must be provided'
  })).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  tax_amount: Joi.number().min(0).default(0),
  total_amount: Joi.number().min(0).required(),
  status: Joi.string().valid("draft", "sent", "received", "cancelled").default("draft"),
  notes: Joi.string().optional()
});

const updatePurchaseOrderSchema = purchaseOrderSchema.fork(
  Object.keys(purchaseOrderSchema.describe().keys),
  (schema) => schema.optional()
);

// Routes
router.post("/", validate(purchaseOrderSchema), createPurchaseOrder);
router.get("/", getPurchaseOrders);
router.get("/stats", getPurchaseOrderStats);
router.get("/:id", getPurchaseOrderById);
router.put("/:id", validate(updatePurchaseOrderSchema), updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export default router;


