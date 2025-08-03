import jwt from "jsonwebtoken";

const TOKEN_TTL = "7d";                    // cookie lifetime

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

// Express middleware – attaches req.user
export const authGuard = (req, res, next) => {
  const token = req.cookies["rb_session"];
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid / expired token" });
  }
};
