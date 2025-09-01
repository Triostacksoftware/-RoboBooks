import express from "express";
import multer from "multer";
import { authGuard } from "../utils/jwt.js";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  hardDeleteCustomer,
  getCustomersByType,
  searchCustomers,
  getCustomerStats,
  bulkUploadCustomers,
  downloadCustomerTemplate,
  previewExcelFile,
} from "../controllers/customerController.js";

const router = express.Router();

// Configure multer for Excel file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only Excel files (.xls, .xlsx) are allowed."
        ),
        false
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Bulk upload routes (with authentication)
router.post(
  "/bulk-upload",
  authGuard,
  upload.single("excel"),
  handleMulterError,
  bulkUploadCustomers
);
router.post(
  "/preview-excel",
  authGuard,
  upload.single("excel"),
  handleMulterError,
  previewExcelFile
);
router.get("/download-template", authGuard, downloadCustomerTemplate);

// Create a new customer
router.post("/", createCustomer);

// Get all customers with pagination and filtering
router.get("/", getAllCustomers);

// Get customer statistics
router.get("/stats", getCustomerStats);

// Search customers
router.get("/search", searchCustomers);

// Get customers by type (business or individual)
router.get("/type/:type", getCustomersByType);

// Get customer by ID
router.get("/:id", getCustomerById);

// Update customer by ID
router.put("/:id", updateCustomer);

// Patch customer by ID (partial update)
router.patch("/:id", updateCustomer);

// Soft delete customer by ID
router.delete("/:id", deleteCustomer);

// Hard delete customer by ID (admin only)
router.delete("/:id/permanent", hardDeleteCustomer);

export default router;
