import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { authGuard } from "../utils/jwt.js";

import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
} from "../controllers/documentController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure signatures directory exists
const signaturesDir = path.join(__dirname, "../uploads/signatures");
if (!fs.existsSync(signaturesDir)) {
  fs.mkdirSync(signaturesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Configure multer for signature uploads
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const signaturesDir = path.join(__dirname, "../uploads/signatures");
    console.log('Signature destination directory:', signaturesDir);
    console.log('Directory exists:', fs.existsSync(signaturesDir));
    cb(null, signaturesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = "signature-" + uniqueSuffix + ext;
    console.log('Generated signature filename:', filename);
    cb(null, filename);
  },
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, and image files are allowed."), false);
  }
};

// File filter for signatures (only images)
const signatureFileFilter = (req, file, cb) => {
  console.log('Signature file filter - file details:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype);
    cb(new Error("Invalid file type. Only image files (JPEG, PNG, GIF, WebP) are allowed for signatures."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const signatureUpload = multer({
  storage: signatureStorage,
  fileFilter: signatureFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for signatures
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

// Routes
router.post("/upload", authGuard, upload.single("document"), handleMulterError, uploadDocument);

// Test endpoint for signature upload (without auth for testing)
router.post("/test-signature-upload", signatureUpload.single("signature"), (req, res) => {
  try {
    console.log('Test signature upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file in test request');
      return res.status(400).json({ success: false, message: "No signature file uploaded." });
    }
    
    console.log('Test file details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Return the file path relative to uploads directory
    const relativePath = req.file.path.replace(path.join(__dirname, "../uploads/"), "");
    console.log('Test relative path:', relativePath);
    
    res.status(200).json({ 
      success: true, 
      message: "Test signature uploaded successfully.", 
      signatureUrl: relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error("Test signature upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing test signature upload." 
    });
  }
});

router.post("/upload-signature", authGuard, signatureUpload.single("signature"), (req, res) => {
  try {
    console.log('Signature upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ success: false, message: "No signature file uploaded." });
    }
    
    console.log('File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Return the file path relative to uploads directory
    const relativePath = req.file.path.replace(path.join(__dirname, "../uploads/"), "");
    console.log('Relative path:', relativePath);
    
    res.status(200).json({ 
      success: true, 
      message: "Signature uploaded successfully.", 
      signatureUrl: relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error("Signature upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing signature upload." 
    });
  }
});
router.get("/", authGuard, getDocuments);
router.get("/stats", authGuard, getDocumentStats);
router.get("/:id", authGuard, getDocumentById);
router.put("/:id", authGuard, updateDocument);
router.delete("/:id", authGuard, deleteDocument);
router.get("/:id/download", authGuard, downloadDocument);

export default router;


