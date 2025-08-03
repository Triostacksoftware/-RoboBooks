import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
import bankRoutes from "./routes/bankTransactions.js";

const app = express();

// ── Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Connect Database
connectDB();

// ── Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/bank-transactions", bankRoutes);

// ── Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ── Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend API running on http://localhost:${PORT}`)
);
