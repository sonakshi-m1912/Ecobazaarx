// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Basic authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated" });
    }

    // Attach user info
    req.userId = user._id;
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    } else {
      return res.status(500).json({ message: "Server error during authentication" });
    }
  }
};

// Role check middlewares
export const isAdmin = async (req, res, next) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

export const isSeller = async (req, res, next) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role !== "seller" && user.role !== "admin")
    return res.status(403).json({ message: "Seller access required" });
  next();
};

export const isCustomer = async (req, res, next) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role !== "customer" && user.role !== "admin")
    return res.status(403).json({ message: "Customer access required" });
  next();
};
