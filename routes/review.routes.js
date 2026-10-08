import { Router } from "express";
import {
  getProductReviews,
  createCustomerReview,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  createAdminReview,
  deleteReviewAdmin,
  getHomeFeaturedReviews,
  toggleHomeFeaturedAdmin
} from "../controllers/review.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

// Public Routes
router.get("/reviews/product/:productId", getProductReviews);
router.get("/reviews/featured-home", getHomeFeaturedReviews);
router.post("/reviews", createCustomerReview);

// Admin Routes (Protected)
router.get("/reviews/admin/all", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), getAllReviewsAdmin);
router.patch("/reviews/admin/:id/status", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), updateReviewStatusAdmin);
router.patch("/reviews/admin/:id/toggle-home", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), toggleHomeFeaturedAdmin);
router.post("/reviews/admin/add", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), createAdminReview);
router.delete("/reviews/admin/:id", verifyToken, checkRole(["SUPER_ADMIN", "admin"]), deleteReviewAdmin);

export default router;
