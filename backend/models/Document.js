import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    maxlength: 255
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['invoice', 'receipt', 'contract', 'statement', 'certificate', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  relatedEntity: {
    type: {
      type: String,
      enum: ['currency_adjustment', 'journal_entry', 'account', 'none']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['private', 'internal', 'public'],
    default: 'private'
  },
  version: {
    type: Number,
    default: 1
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  checksum: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastAccessed: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.entityId': 1 });
documentSchema.index({ filename: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for file extension
documentSchema.virtual('extension').get(function() {
  return this.filename.split('.').pop().toLowerCase();
});

// Virtual for human readable size
documentSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to update access tracking
documentSchema.methods.trackAccess = function() {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  return this.save();
};

// Method to archive document
documentSchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  return this.save();
};

// Method to restore document
documentSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  return this.save();
};

// Static method to get documents by entity
documentSchema.statics.getByEntity = function(entityType, entityId, userId) {
  return this.find({
    'relatedEntity.type': entityType,
    'relatedEntity.entityId': entityId,
    userId,
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Static method to get documents by category
documentSchema.statics.getByCategory = function(category, userId) {
  return this.find({
    category,
    userId,
    isArchived: false
  }).sort({ createdAt: -1 });
};

const Document = mongoose.model('Document', documentSchema);

export default Document;