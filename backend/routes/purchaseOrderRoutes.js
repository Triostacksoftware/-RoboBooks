import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createPurchaseOrder, 
  getPurchaseOrders, 
  getPurchaseOrderById, 
  updatePurchaseOrder, 
  deletePurchaseOrder 
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

// Apply authentication to all purchase order routes
router.use(authGuard);

const purchaseOrderSchema = Joi.object({
  vendor_id: Joi.string().required(),
  po_number: Joi.string().required(),
  order_date: Joi.date().required(),
  expected_delivery_date: Joi.date().required(),
  items: Joi.array().items(Joi.object({
    item_id: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    unit_price: Joi.number().min(0).required(),
    total: Joi.number().min(0).required()
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
router.get("/:id", getPurchaseOrderById);
router.put("/:id", validate(updatePurchaseOrderSchema), updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export default router;
