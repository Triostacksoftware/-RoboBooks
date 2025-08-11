import express from "express";
import {
  listSalespersons,
  createSalesperson,
  updateSalesperson,
  deleteSalesperson,
} from "../controllers/salespersonController.js";
// Auth temporarily disabled to unblock UI flow. TODO: protect with authenticate.

const router = express.Router();

router.get("/", listSalespersons);
router.post("/", createSalesperson);
router.put("/:id", updateSalesperson);
router.delete("/:id", deleteSalesperson);

export default router;
