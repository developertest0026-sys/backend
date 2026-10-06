import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";

/**
 * Global Rate Limiter:
 * Prevents rapid spamming & DDoS attacks across all API routes.
 * Limits each IP to 300 requests per 15-minute window.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Boht jyada requests ek sath bheji gayi hain. Kripya 15 min ke baad fir se try karein. (Too many requests from this IP, please try again after 15 minutes.)"
  }
});

/**
 * Strict Rate Limiter for Auth Routes (Login / Password Reset):
 * Prevents brute-force credential stuffing attacks.
 * Limits each IP to 10 attempts per 15-minute window.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes before trying again."
  }
});

/**
 * Strict Rate Limiter for Uploads & Critical Mutations:
 * Limits each IP to 60 create/update actions per 15-minute window.
 */
export const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests in a short time. Please slow down."
  }
});

/**
 * NoSQL Injection Sanitizer:
 * Sanitizes incoming user data (req.body, req.query, req.params)
 * by removing keys starting with '$' or containing '.'
 */
export const sanitizeNoSQL = mongoSanitize({
  replaceWith: "_"
});

/**
 * SQL Injection Guard (relaxed for MongoDB & Media uploads to prevent false positives)
 */
export const sanitizeSQL = (req, res, next) => {
  // MongoDB is NoSQL; sanitizeNoSQL already handles $ and . operator injection.
  // sanitizeSQL skipped to prevent false positive blocks on Base64 image payloads and descriptions.
  next();
};

/**
 * HTTP Security Headers (Helmet)
 */
export const configureHelmet = helmet({
  contentSecurityPolicy: false, // Disabled for flexible media & ImageKit loading
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * HTTP Parameter Pollution Protection
 */
export const configureHPP = hpp();
