import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import mongoose from "mongoose";
// import app from "./app.js";

import accountsRoutes from "./routes/accounts.js";
import bankRoutes from "./routes/bankTransactions.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import billsRoutes from "./routes/bills.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import estimatesRoutes from "./routes/estimates.routes.js";

import invoiceRoutes from "./routes/invoiceroutes.js";
import projectRoutes from "./routes/projectroutes.js";
import timesheetRoutes from "./routes/timesheetroutes.js";

// server.js  (or index.js)
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";

import "./config/passport.js";

// ─── Route imports ───────────────────────────────────────────────────────────────
//import accountRoutes from './routes/accountRoutes.js';
//import journalRoutes from './routes/journalRoutes.js';
import bankTransactionRoutes from "./routes/bankTransactionRoutes.js";
// ────────────────────────────────────────────────────────────────────────────────

dotenv.config();
const app = express();

// ── Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
connectDB();
// ─── Global middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Passport session (for OAuth)
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true behind HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
// ────────────────────────────────────────────────────────────────────────────────

// ─── API routes ────────────────────────────────────────────────────────────────
//app.use('/api/accounts',           accountRoutes);
//app.use('/api/journal-entries',    journalRoutes);

// ── Connect Database
connectDB();

// ── Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/bank-transactions", bankRoutes);
// auth + financial modules

app.use("/api/vendors", vendorsRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/estimates", estimatesRoutes);
app.use("/api/bank-transactions", bankTransactionRoutes);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheets", timesheetRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to the RoboBooks API");
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

// ── Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend API running on http://localhost:${PORT}`)
);
connectDB();
