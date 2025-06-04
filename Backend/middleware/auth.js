import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload should have { userId, role }
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Make userId a string, so downstream code is consistent
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// If you need specific role check (e.g., only organizers for certain routes):
export function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== expectedRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
}
