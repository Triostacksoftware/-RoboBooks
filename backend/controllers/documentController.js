import Document from "../models/Document.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logAction } from "../services/auditTrailservice.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    console.log("Upload request received:", {
      file: req.file ? "File present" : "No file",
      body: req.body,
      user: req.user
    });

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const {
      title,
      description,
      documentType = "other",
      category = "other",
      tags = [],
      isPublic = false,
    } = req.body;

    console.log("Processing upload with data:", {
      title,
      description,
      documentType,
      category,
      tags,
      isPublic,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user.uid
    });

    if (!title) {
      console.log("Title is missing");
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const document = new Document({
      title,
      description,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType,
      category,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      uploadedBy: req.user.uid,
      isPublic,
    });

    console.log("Saving document to database...");
    await document.save();
    console.log("Document saved successfully:", document._id);

    // Log audit trail
    await logAction({
      user: req.user.uid,
      action: "upload",
      entity: "document",
      entityId: document._id,
      message: `Document "${title}" uploaded successfully`,
      details: {
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType,
        category
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error.message,
    });
  }
};

// Get all documents with pagination and filters
export const getDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      documentType,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by document type
    if (documentType) {
      query.documentType = documentType;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const documents = await Document.find(query)
      .populate("uploadedBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDocuments: total,
        hasNext: skip + documents.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploadedBy", "name email");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get document by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: error.message,
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      documentType,
      category,
      tags,
      isPublic,
    } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user is the owner or admin
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this document",
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (documentType) updateData.documentType = documentType;
    if (category) updateData.category = category;
    if (tags !== undefined) {
      updateData.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("uploadedBy", "name email");

    // Log audit trail
    await logAction({
      user: req.user.uid,
      action: "update",
      entity: "document",
      entityId: req.params.id,
      message: `Document "${updatedDocument.title}" updated`,
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating document",
      error: error.message,
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user is the owner or admin
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    // Log audit trail
    await logAction({
      user: req.user.uid,
      action: "delete",
      entity: "document",
      entityId: req.params.id,
      message: `Document "${document.title}" deleted`,
      details: {
        fileName: document.fileName,
        originalName: document.originalName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
      error: error.message,
    });
  }
};

// Get document statistics
export const getDocumentStats = async (req, res) => {
  try {
    const stats = await Document.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          byType: {
            $push: {
              type: "$documentType",
              size: "$fileSize",
            },
          },
          byCategory: {
            $push: {
              category: "$category",
              size: "$fileSize",
            },
          },
        },
      },
    ]);

    const typeStats = await Document.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$documentType",
          count: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
        },
      },
    ]);

    const categoryStats = await Document.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalDocuments: 0, totalSize: 0 },
        byType: typeStats,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    console.error("Get document stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching document statistics",
      error: error.message,
    });
  }
};
