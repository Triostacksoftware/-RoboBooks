// backend/utils/token.js
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import RefreshToken from '../models/RefreshToken.js';

dotenv.config();

const ACCESS_TOKEN_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_TTL     = '15m';              // access JWT lifespan
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1e3; // 7 days

/* ─────────────────────────────────── ACCESS ── */
export const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_TOKEN_SECRET);

/* ────────────────────────────────── REFRESH ── */
export const generateRefreshToken = async (user, device = 'unknown') => {
  const token  = uuidv4();
  const expiry = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await RefreshToken.create({
    user: user._id,
    token,
    expiry,
    device_info: device,
  });

  return token;
};

export const verifyRefreshToken = async (token) => {
  const record = await RefreshToken.findOne({ token }).populate('user');
  if (!record || record.expiry < new Date()) return null;
  return record;
};

/* OPTIONAL helper to rotate tokens */
export const rotateRefreshToken = async (oldToken, user, device = 'unknown') => {
  await RefreshToken.deleteOne({ token: oldToken });
  return generateRefreshToken(user, device);
};
