import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.get("/dashboard/stats", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), getDashboardStats);

export default router;
