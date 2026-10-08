import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import mediaRoutes from "./media.routes.js";
import enquiryRoutes from "./enquiry.routes.js";
import orderRoutes from "./order.routes.js";
import transactionRoutes from "./transaction.routes.js";
import videoRoutes from "./video.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", categoryRoutes);
router.use("/", productRoutes);
router.use("/", mediaRoutes);
router.use("/", enquiryRoutes);
router.use("/", orderRoutes);
router.use("/", transactionRoutes);
router.use("/", videoRoutes);
router.use("/", dashboardRoutes);
router.use("/", reviewRoutes);

export default router;
