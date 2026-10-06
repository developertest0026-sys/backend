import { Router } from "express";
import { 
  checkoutOrder, 
  verifyCashfreePayment,
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from "../controllers/order.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.post("/orders/checkout", checkoutOrder);
router.post("/orders/verify-cashfree", verifyCashfreePayment);
router.get("/orders", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), getOrders);
router.get("/orders/:id", getOrderById);
router.patch("/admin/orders/:id/status", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), updateOrderStatus);
router.delete("/admin/orders/:id", verifyToken, checkRole(["SUPER_ADMIN", "ORDER_MANAGER", "admin"]), deleteOrder);

export default router;

