import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import billsRoutes from "./routes/bills.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import estimatesRoutes from "./routes/estimates.routes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (_req, res) => {
  res.send("Welcome to the RoboBooks API");
});

// auth + financial modules
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorsRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/estimates", estimatesRoutes);

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 API running on http://localhost:${PORT}`)
);
