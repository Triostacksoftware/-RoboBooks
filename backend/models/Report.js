import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "System Generated",
    },
    type: {
      type: String,
      enum: ["system", "custom"],
      default: "system",
    },
    category: {
      type: String,
      enum: [
        "business_overview",
        "sales",
        "purchases_expenses",
        "banking",
        "accounting",
        "time_tracking",
        "inventory",
        "budgets",
        "currency",
        "activity",
        "advanced_financial",
        "tds_reports",
        "gst_reports",
      ],
      required: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    filters: {
      dateRange: {
        start: Date,
        end: Date,
      },
      customers: [String],
      items: [String],
      categories: [String],
      status: [String],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastRun: {
      type: Date,
      default: null,
    },
    schedule: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      },
      nextRun: Date,
      recipients: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
reportSchema.index({ category: 1, type: 1, createdBy: 1 });
reportSchema.index({ isFavorite: 1, createdBy: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
