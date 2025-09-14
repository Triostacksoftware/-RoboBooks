import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createRecurringBill, 
  getRecurringBills, 
  getRecurringBillById, 
  updateRecurringBill, 
  deleteRecurringBill 
} from "../controllers/recurringBillController.js";

const router = express.Router();

// Apply authentication to all recurring bill routes
router.use(authGuard);

const recurringBillSchema = Joi.object({
  vendor_id: Joi.string().required(),
  bill_number: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  frequency: Joi.string().valid("weekly", "monthly", "quarterly", "yearly").required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().optional(),
  due_days: Joi.number().min(1).default(30),
  description: Joi.string().optional(),
  is_active: Joi.boolean().default(true)
});

const updateRecurringBillSchema = recurringBillSchema.fork(
  Object.keys(recurringBillSchema.describe().keys),
  (schema) => schema.optional()
);

// Routes
router.post("/", validate(recurringBillSchema), createRecurringBill);
router.get("/", getRecurringBills);
router.get("/:id", getRecurringBillById);
router.put("/:id", validate(updateRecurringBillSchema), updateRecurringBill);
router.delete("/:id", deleteRecurringBill);

export default router;
