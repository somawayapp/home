import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: "NOT_AUTHENTICATED" });
    }

    // ✅ Verify token, throws error if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "NOT_AUTHENTICATED" });
    }

    req.user = await User.findById(decoded).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, message: "NOT_AUTHENTICATED" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "NOT_AUTHENTICATED" });
  }
};
