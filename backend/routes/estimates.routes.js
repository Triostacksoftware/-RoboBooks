import express from "express";
import Joi from "joi";
import { authGuard } from "../utils/jwt.js";
import validate from "../middlewares/validation.middleware.js";
import {
  createEstimate,
  getEstimateById,
} from "../controllers/estimates.controller.js";

const router = express.Router();

// Apply authentication to all estimates routes
router.use(authGuard);

const estimateSchema = Joi.object({
  customer_id: Joi.string().required(),
  valid_until: Joi.date().required(),
  status: Joi.string()
    .valid("draft", "sent", "accepted", "rejected")
    .required(),
});

router.post("/", validate(estimateSchema), createEstimate);
router.get("/:id", getEstimateById);

export default router;
