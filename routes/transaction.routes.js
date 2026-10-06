import { Router } from "express";
import { handleCashfreeWebhook, getTransactions } from "../controllers/transaction.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.post("/payments/webhook/cashfree", handleCashfreeWebhook);
router.get("/admin/transactions", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER"]), getTransactions);

export default router;
