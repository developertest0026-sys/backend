import { Router } from "express";
import { generateUploadUrl, confirmMediaUpload, getImageKitAuth, uploadImageKitFile } from "../controllers/media.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

// ImageKit endpoints
router.get("/media/imagekit-auth", verifyToken, getImageKitAuth);
router.post("/media/imagekit-upload", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER"]), uploadImageKitFile);

// Legacy / Cloudflare R2 direct presigned URL endpoints
router.post("/media/upload-url", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER"]), generateUploadUrl);
router.post("/media/confirm", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER"]), confirmMediaUpload);

export default router;
