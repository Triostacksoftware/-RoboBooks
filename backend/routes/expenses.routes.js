import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import {
  createExpense,
  listExpenses,
} from "../controllers/expenses.controller.js";

const router = express.Router();

// Apply authentication to all expenses routes
router.use(authGuard);

const expenseSchema = Joi.object({
  category: Joi.string().required(),
  amount: Joi.number().precision(2).required(),
  date: Joi.date().required(),
  billable: Joi.boolean().required(),
});

router.post("/", validate(expenseSchema), createExpense);
router.get("/", listExpenses);

export default router;


