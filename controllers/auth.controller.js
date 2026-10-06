import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

// Dummy hash used for constant-time comparison to prevent timing attacks when email is not found
const DUMMY_HASH = "$2a$10$e7K4Q5w7G4p5Y7z9X8w7eu6W5v4u3t2s1r0q9p8o7n6m5l4k3j2i1";

/**
 * 🔒 Ultra-Secure Admin & Customer Login Controller
 * Protected against SQL Injection, NoSQL Injection, Type Manipulation, and Timing Attacks.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Strict Input Type Validation
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input payload. Email and password must be valid text strings."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Query MongoDB safely with exact match string
    let account = await Admin.findOne({ email: cleanEmail });
    let isStaff = true;

    if (!account) {
      account = await User.findOne({ email: cleanEmail });
      isStaff = false;
    }

    // 3. Timing Attack Mitigation & Password Hash Comparison
    const targetHash = account ? account.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, targetHash);

    if (!account || !isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 4. Account Activation Check
    if (account.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact support."
      });
    }

    const role = isStaff ? (account.role || "SUPER_ADMIN") : "customer";

    // 5. JWT Sign with Cryptographic Secret
    const token = jwt.sign(
      { id: account._id.toString(), role, isStaff },
      process.env.JWT_SECRET || "swariya_jewellers_jwt_secret_key_2026",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d", algorithm: "HS256" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          role,
          isStaff
        }
      }
    });
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Register Dedicated Admin Staff
 * Writes to Admin collection in MongoDB.
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, fullName, email, password, role } = req.body || {};
    const adminName = (fullName || name || "").toString().trim();
    const adminEmail = (email || "").toString().trim().toLowerCase();

    if (!adminName || !adminEmail || !password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration payload. Name, email and password are required strings."
      });
    }

    const existing = await Admin.findOne({ email: adminEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Admin account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: passwordHash,
      role: role || "SUPER_ADMIN"
    });

    return res.status(201).json({
      success: true,
      message: "Admin account registered successfully",
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error("Register Admin Controller Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Get Authenticated Profile
 */
export const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};
