import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

import connectDB from "./config/db.js";
import "./config/passport.js";

// Route imports
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
// Removed legacy bankTransactions router to avoid conflicts
import vendorsRoutes from "./routes/vendors.routes.js";
import billsRoutes from "./routes/bills.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import estimatesRoutes from "./routes/estimates.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import projectRoutes from "./routes/projectroutes.js";
import timesheetRoutes from "./routes/timesheetroutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bankTransactionRoutes from "./routes/bankTransactionRoutes.js";
import bankAccountRoutes from "./routes/bankAccountRoutes.js";
import bankReconciliationRoutes from "./routes/bankReconciliationRoutes.js";
import bankingOverviewRoutes from "./routes/bankingOverviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import manualJournalRoutes from "./routes/manualJournalRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import bulkUpdateRoutes from "./routes/bulkUpdateRoutes.js";
import tdsRoutes from "./routes/tdsRoutes.js";
import tcsRoutes from "./routes/tcsRoutes.js";
import deliveryChallanRoutes from "./routes/deliveryChallanRoutes.js";
import salespersonRoutes from "./routes/salespersonRoutes.js";

const app = express();

dotenv.config();

console.log("🚀 Starting server...");

// Connect to database
connectDB();

// Global middleware - order is important!
app.use(express.json());
app.use(cookieParser());

// CORS configuration - must be before other middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:3000",
      "https://robobookss.com",
      "https://www.robobookss.com",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("dev"));

// Passport initialization (for OAuth)
app.use(passport.initialize());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
// Keep only the new bank transaction routes
app.use("/api/bank-transactions", bankTransactionRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/bank-reconciliations", bankReconciliationRoutes);
app.use("/api/banking", bankingOverviewRoutes);
app.use("/api/vendors", vendorsRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/estimates", estimatesRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/delivery-challans", deliveryChallanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/manual-journals", manualJournalRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/bulk-updates", bulkUpdateRoutes);
app.use("/api/tds", tdsRoutes);
app.use("/api/tcs", tcsRoutes);
app.use("/api/salespersons", salespersonRoutes);

// Health check and welcome routes
app.get("/", (_req, res) => {
  res.send("Welcome to the RoboBooks API");
});

app.get("/api/health", (_req, res) => {
  console.log("Health check requested");
  res.json({ status: "ok" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`✅ Server is listening on port ${PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

server.on("listening", () => {
  console.log("✅ Server is ready to accept connections");
});
