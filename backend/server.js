// server.js  (or index.js)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';

import './config/db.js';
import './config/passport.js';

// ─── Route imports ───────────────────────────────────────────────────────────────
//import accountRoutes from './routes/accountRoutes.js';
//import journalRoutes from './routes/journalRoutes.js';
import bankTransactionRoutes from './routes/bankTransactionRoutes.js';
import authRoutes from './routes/auth.js';
import connectDB from './config/db.js';
// ────────────────────────────────────────────────────────────────────────────────

dotenv.config();
const app = express();
connectDB();
// ─── Global middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Passport session (for OAuth)
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },       // set true behind HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());
// ────────────────────────────────────────────────────────────────────────────────

// ─── API routes ────────────────────────────────────────────────────────────────
//app.use('/api/accounts',           accountRoutes);
//app.use('/api/journal-entries',    journalRoutes);
app.use('/api/bank-transactions',  bankTransactionRoutes);
app.use('/api/auth',               authRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
// ────────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
