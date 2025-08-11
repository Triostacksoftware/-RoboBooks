import mongoose from "mongoose";

const auditTrailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "upload",
        "download",
        "reconcile",
        "approve",
        "reject",
        "export",
        "import"
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: [
        "user",
        "account",
        "document",
        "invoice",
        "bill",
        "expense",
        "bank_transaction",
        "project",
        "timesheet",
        "customer",
        "vendor",
        "item",
        "payment",
        "report"
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Some actions like login don't have entity IDs
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["success", "failure", "pending"],
      default: "success",
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
auditTrailSchema.index({ user: 1, timestamp: -1 });
auditTrailSchema.index({ entity: 1, entityId: 1 });
auditTrailSchema.index({ action: 1, timestamp: -1 });
auditTrailSchema.index({ timestamp: -1 });

const AuditTrail = mongoose.model("AuditTrail", auditTrailSchema);

export default AuditTrail;
