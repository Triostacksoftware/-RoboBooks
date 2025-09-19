import express from "express";
import multer from "multer";
import * as ctrl from "../controllers/salesOrderController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// CRUD operations - No authentication required
router.get("/", ctrl.getAll);
router.get("/next-number", ctrl.getNextSalesOrderNumber);
router.get("/stats", ctrl.getSalesOrderStats);
router.get("/:id", ctrl.getById);
router.post("/", upload.array('files', 10), ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Status management
router.patch("/:id/status", ctrl.updateStatus);

// Email functionality
router.post("/:id/send-email", ctrl.sendSalesOrderEmail);

export default router;


