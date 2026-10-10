import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import validationMiddleware from "./middlewares/schemaValidator.js";
import {
  globalLimiter,
  sanitizeNoSQL,
  sanitizeSQL,
  configureHelmet,
  configureHPP
} from "./middlewares/security.middleware.js";

const app = express();

// Security HTTP Headers
app.use(configureHelmet);

// Database Connection Middleware for Serverless Edge & Express
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    res.status(500).json({
      success: false,
      message: "Database Connection Error: " + error.message,
    });
  }
});

// Global Cors & Body Parsers
const allowedOrigins = [
  "https://sawyria.com",
  "https://www.sawyria.com",
  "http://localhost:4200", // Angular Dev
  "http://localhost:3000", // React Dev
  "http://localhost:5173"  // Vite Dev
];

app.use(cors({ 
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests) only if they pass Auth, but limit browser origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Strict CORS Policy: This origin is not allowed to access the API.'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json({ 
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// 🔒 Security Middlewares: Global Rate Limiting, Injection Defense & Parameter Sanitation
app.use(globalLimiter);
app.use(sanitizeNoSQL);
app.use(sanitizeSQL);
app.use(configureHPP);

// Joi Schema Validation Middleware
app.use(validationMiddleware(true));

// API Versioned Routing
const prefix = process.env.API_PREFIX || "/api/v1";
app.use(prefix, routes);

// Health Check Endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "online",
    service: "Swariya Jewellers Backend API (MongoDB + Cashfree + Cloudflare)",
    timestamp: new Date().toISOString()
  });
});

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;
