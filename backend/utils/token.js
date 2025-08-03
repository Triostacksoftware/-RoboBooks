// backend/utils/token.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();                       // loads ACCESS_TOKEN_SECRET from .env

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/**
 * Verify an access JWT.
 * @param {string} token
 * @returns {object} decoded payload  (throws if invalid / expired)
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};
