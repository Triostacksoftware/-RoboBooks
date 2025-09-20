import Document from '../models/Document.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and common file types are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      category,
      relatedEntityType,
      relatedEntityId,
      search,
      tags
    } = req.query;

    let query = { userId, isArchived: false };

    // Apply filters
    if (category) query.category = category;
    if (relatedEntityType) query['relatedEntity.type'] = relatedEntityType;
    if (relatedEntityId) query['relatedEntity.entityId'] = relatedEntityId;
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Document.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: documents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await Document.findOne({ _id: documentId, userId })
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Track access
    await document.trackAccess();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Calculate file checksum
    const fileBuffer = fs.readFileSync(file.path);
    const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Create document record
    const document = new Document({
      userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/documents/${file.filename}`,
      category: req.body.category || 'other',
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      relatedEntity: {
        type: req.body.relatedEntityType || 'none',
        entityId: req.body.relatedEntityId || null
      },
      isPublic: req.body.isPublic === 'true',
      accessLevel: req.body.accessLevel || 'private',
      checksum,
      uploadedBy: userId,
      metadata: {
        uploadedAt: new Date(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await document.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Clean up uploaded file if document creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await Document.findOne({ _id: documentId, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Track access
    await document.trackAccess();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', document.size);

    // Stream file to response
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.filename;
    delete updates.path;
    delete updates.url;
    delete updates.checksum;
    delete updates.uploadedBy;

    const document = await Document.findOneAndUpdate(
      { _id: documentId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await Document.findOne({ _id: documentId, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Archive document
export const archiveDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await Document.findOne({ _id: documentId, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.archive(userId);

    res.json({
      success: true,
      message: 'Document archived successfully',
      data: document
    });
  } catch (error) {
    console.error('Error archiving document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive document',
      error: error.message
    });
  }
};

// Restore document
export const restoreDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await Document.findOne({ _id: documentId, userId });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.restore();

    res.json({
      success: true,
      message: 'Document restored successfully',
      data: document
    });
  } catch (error) {
    console.error('Error restoring document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore document',
      error: error.message
    });
  }
};

// Get document statistics
export const getDocumentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Document.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$size' },
          averageSize: { $avg: '$size' },
          categories: { $addToSet: '$category' },
          totalAccessCount: { $sum: '$accessCount' }
        }
      }
    ]);

    const categoryStats = await Document.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentDocuments = await Document.find({ userId, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('filename originalName category createdAt size');

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDocuments: 0,
          totalSize: 0,
          averageSize: 0,
          categories: [],
          totalAccessCount: 0
        },
        categoryStats,
        recentDocuments
      }
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document statistics',
      error: error.message
    });
  }
};