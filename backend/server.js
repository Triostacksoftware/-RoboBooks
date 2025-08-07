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
import bankRoutes from "./routes/bankTransactions.js";
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

const app = express();

dotenv.config();

// Connect to database
connectDB();

// Global middleware - order is important!
app.use(express.json());
app.use(cookieParser());

// CORS configuration - must be before other middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
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
app.use("/api/bank-transactions", bankRoutes);
app.use("/api/vendors", vendorsRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/estimates", estimatesRoutes);
app.use("/api/bank-transactions", bankTransactionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);

// Health check and welcome routes
app.get("/", (_req, res) => {
  res.send("Welcome to the RoboBooks API");
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend API running on http://localhost:${PORT}`)
);
