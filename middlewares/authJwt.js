import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided in Authorization header"
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "swariya_jewellers_jwt_secret_key_2026");

    let account = null;
    let isStaff = false;

    if (decoded.isStaff !== false) {
      account = await Admin.findById(decoded.id).select("-password");
      if (account) isStaff = true;
    }

    if (!account) {
      account = await User.findById(decoded.id).select("-password");
      isStaff = false;
    }

    if (!account) {
      return res.status(401).json({ success: false, message: "Account no longer exists" });
    }

    if (account.isActive === false) {
      return res.status(403).json({ success: false, message: "Account has been deactivated" });
    }

    req.user = {
      ...account.toObject(),
      isStaff,
      role: isStaff ? (account.role || "SUPER_ADMIN") : "customer"
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token"
    });
  }
};

export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role) && !req.user.isStaff) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of these roles: ${roles.join(", ")}`
      });
    }

    next();
  };
};
