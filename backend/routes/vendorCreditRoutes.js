import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import { 
  createVendorCredit, 
  getVendorCredits, 
  getVendorCreditById, 
  updateVendorCredit, 
  deleteVendorCredit 
} from "../controllers/vendorCreditController.js";

const router = express.Router();

// Apply authentication to all vendor credit routes
router.use(authGuard);

const vendorCreditSchema = Joi.object({
  vendor_id: Joi.string().required(),
  credit_number: Joi.string().required(),
  credit_date: Joi.date().required(),
  amount: Joi.number().precision(2).required(),
  reason: Joi.string().required(),
  reference: Joi.string().optional(),
  status: Joi.string().valid("pending", "applied", "expired").default("pending"),
  notes: Joi.string().optional()
});

const updateVendorCreditSchema = vendorCreditSchema.fork(
  Object.keys(vendorCreditSchema.describe().keys),
  (schema) => schema.optional()
);

// Routes
router.post("/", validate(vendorCreditSchema), createVendorCredit);
router.get("/", getVendorCredits);
router.get("/:id", getVendorCreditById);
router.put("/:id", validate(updateVendorCreditSchema), updateVendorCredit);
router.delete("/:id", deleteVendorCredit);

export default router;
