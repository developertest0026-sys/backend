import { Router } from "express";
import { login, registerAdmin, getProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/authJwt.js";
import { authLimiter } from "../middlewares/security.middleware.js";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/register-admin", authLimiter, registerAdmin);
router.get("/me", verifyToken, getProfile);

export default router;

