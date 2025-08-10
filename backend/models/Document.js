import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ["invoice", "receipt", "contract", "agreement", "certificate", "license", "other"],
      default: "other",
    },
    category: {
      type: String,
      enum: ["financial", "legal", "compliance", "business", "other"],
      default: "other",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
documentSchema.index({ title: "text", description: "text", tags: "text" });
documentSchema.index({ documentType: 1, category: 1 });
documentSchema.index({ uploadedBy: 1, isActive: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
