import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { createBill, getBillById } from "../controllers/bills.controller.js";

const router = express.Router();

// Apply authentication to all bills routes
router.use(authGuard);

const billSchema = Joi.object({
  vendor_id: Joi.string().required(),
  total: Joi.number().precision(2).required(),
  status: Joi.string().valid("pending", "paid", "overdue").required(),
  due_date: Joi.date().required(),
});

router.post("/", validate(billSchema), createBill);
router.get("/:id", getBillById);

export default router;
