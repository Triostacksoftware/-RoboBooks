import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createPaymentMade, 
  getPaymentsMade, 
  getPaymentMadeById, 
  updatePaymentMade, 
  deletePaymentMade 
} from "../controllers/paymentMadeController.js";

const router = express.Router();

// Apply authentication to all payment made routes
router.use(authGuard);

const paymentMadeSchema = Joi.object({
  vendor_id: Joi.string().required(),
  bill_id: Joi.string().optional(),
  amount: Joi.number().precision(2).required(),
  payment_date: Joi.date().required(),
  payment_method: Joi.string().valid("cash", "check", "bank_transfer", "credit_card", "other").required(),
  reference_number: Joi.string().optional(),
  notes: Joi.string().optional(),
  status: Joi.string().valid("pending", "completed", "failed").default("completed")
});

const updatePaymentMadeSchema = paymentMadeSchema.fork(
  Object.keys(paymentMadeSchema.describe().keys),
  (schema) => schema.optional()
);

// Routes
router.post("/", validate(paymentMadeSchema), createPaymentMade);
router.get("/", getPaymentsMade);
router.get("/:id", getPaymentMadeById);
router.put("/:id", validate(updatePaymentMadeSchema), updatePaymentMade);
router.delete("/:id", deletePaymentMade);

export default router;
