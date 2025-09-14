import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createRecurringExpense, 
  getRecurringExpenses, 
  getRecurringExpenseById, 
  updateRecurringExpense, 
  deleteRecurringExpense 
} from "../controllers/recurringExpenseController.js";

const router = express.Router();

// Apply authentication to all recurring expense routes
router.use(authGuard);

const recurringExpenseSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  frequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().optional(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  vendor: Joi.string().optional(),
  account: Joi.string().optional(),
  is_active: Joi.boolean().default(true)
});

const updateRecurringExpenseSchema = recurringExpenseSchema.fork(
  Object.keys(recurringExpenseSchema.describe().keys),
  (schema) => schema.optional()
);

// Routes
router.post("/", validate(recurringExpenseSchema), createRecurringExpense);
router.get("/", getRecurringExpenses);
router.get("/:id", getRecurringExpenseById);
router.put("/:id", validate(updateRecurringExpenseSchema), updateRecurringExpense);
router.delete("/:id", deleteRecurringExpense);

export default router;
