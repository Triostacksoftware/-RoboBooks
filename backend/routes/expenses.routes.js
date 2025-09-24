import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { upload, handleUploadError } from "../middlewares/upload.middleware.js";
import {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseStats,
  getExpensesByCategory,
  getExpensesByVendor,
  bulkUpdateExpenses,
  getRecurringExpenses,
  uploadReceipt,
  deleteReceipt,
} from "../controllers/expenses.controller.js";

const router = express.Router();

// Apply authentication to all expenses routes
router.use(authGuard);

// Validation schemas
const createExpenseSchema = Joi.object({
  date: Joi.date().required(),
  expenseAccount: Joi.string().required(),
  amount: Joi.number().precision(2).min(0).required(),
  paidThrough: Joi.string().required(),
  vendor: Joi.string().optional(),
  customer: Joi.string().optional(),
  invoiceNumber: Joi.string().optional(),
  referenceNumber: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
  taxAmount: Joi.number().precision(2).min(0).default(0),
  taxRate: Joi.number().precision(2).min(0).max(100).default(0),
  isTaxInclusive: Joi.boolean().default(false),
  project: Joi.string().optional(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "supplies",
      "equipment",
      "office",
      "marketing",
      "utilities",
      "rent",
      "insurance",
      "other"
    )
    .default("other"),
  tags: Joi.array().items(Joi.string()).optional(),
  reportingTags: Joi.array().items(Joi.string()).optional(),
  mileage: Joi.object({
    distance: Joi.number().min(0).optional(),
    rate: Joi.number().precision(2).min(0).optional(),
    totalAmount: Joi.number().precision(2).min(0).optional(),
  }).optional(),
  isRecurring: Joi.boolean().default(false),
  recurringPattern: Joi.object({
    frequency: Joi.string()
      .valid("daily", "weekly", "monthly", "yearly")
      .optional(),
    interval: Joi.number().min(1).default(1),
    endDate: Joi.date().optional(),
  }).optional(),
});

const updateExpenseSchema = Joi.object({
  date: Joi.date().optional(),
  expenseAccount: Joi.string().optional(),
  amount: Joi.number().precision(2).min(0).optional(),
  paidThrough: Joi.string().optional(),
  vendor: Joi.string().optional(),
  customer: Joi.string().optional(),
  invoiceNumber: Joi.string().optional(),
  referenceNumber: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
  taxAmount: Joi.number().precision(2).min(0).optional(),
  taxRate: Joi.number().precision(2).min(0).max(100).optional(),
  isTaxInclusive: Joi.boolean().optional(),
  project: Joi.string().optional(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "supplies",
      "equipment",
      "office",
      "marketing",
      "utilities",
      "rent",
      "insurance",
      "other"
    )
    .optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  reportingTags: Joi.array().items(Joi.string()).optional(),
  mileage: Joi.object({
    distance: Joi.number().min(0).optional(),
    rate: Joi.number().precision(2).min(0).optional(),
    totalAmount: Joi.number().precision(2).min(0).optional(),
  }).optional(),
  isRecurring: Joi.boolean().optional(),
  recurringPattern: Joi.object({
    frequency: Joi.string()
      .valid("daily", "weekly", "monthly", "yearly")
      .optional(),
    interval: Joi.number().min(1).optional(),
    endDate: Joi.date().optional(),
  }).optional(),
});

const bulkUpdateSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).required(),
  updateData: Joi.object().required(),
});

// Routes
router.post("/", validate(createExpenseSchema), createExpense);
router.get("/", listExpenses);
router.get("/stats", getExpenseStats);
router.get("/by-category", getExpensesByCategory);
router.get("/by-vendor", getExpensesByVendor);
router.get("/recurring", getRecurringExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", validate(updateExpenseSchema), updateExpense);
router.delete("/:id", deleteExpense);
router.patch("/:id/approve", approveExpense);
router.patch("/:id/reject", rejectExpense);
router.patch("/bulk-update", validate(bulkUpdateSchema), bulkUpdateExpenses);

// Receipt routes
router.post(
  "/:id/receipts",
  upload.single("receipt"),
  handleUploadError,
  uploadReceipt
);
router.delete("/:id/receipts/:receiptId", deleteReceipt);

export default router;


