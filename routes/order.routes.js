import { Router } from "express";
import { 
  checkoutOrder, 
  verifyCashfreePayment,
  handleCashfreeWebhook,
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from "../controllers/order.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.post("/orders/checkout", checkoutOrder);
router.post("/orders/verify-cashfree", verifyCashfreePayment);
router.post("/orders/webhook/cashfree", handleCashfreeWebhook);

// Protected Admin Order Routes
router.get("/orders", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), getOrders);
router.get("/orders/:id", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), getOrderById);
router.put("/orders/:id/status", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), updateOrderStatus);
router.patch("/admin/orders/:id/status", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), updateOrderStatus);
router.delete("/orders/:id", verifyToken, checkRole(["SUPER_ADMIN", "admin"]), deleteOrder);
router.delete("/admin/orders/:id", verifyToken, checkRole(["SUPER_ADMIN", "admin"]), deleteOrder);

export default router;


