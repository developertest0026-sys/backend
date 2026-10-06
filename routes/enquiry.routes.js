import { Router } from "express";
import { 
  createEnquiry, 
  getEnquiries, 
  updateEnquiryStatus, 
  deleteEnquiry 
} from "../controllers/enquiry.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.post("/enquiries", createEnquiry);
router.get("/enquiries", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), getEnquiries);
router.put("/enquiries/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), updateEnquiryStatus);
router.delete("/enquiries/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "admin"]), deleteEnquiry);

export default router;
