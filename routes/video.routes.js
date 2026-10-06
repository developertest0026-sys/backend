import { Router } from "express";
import { getVideos, createVideo, updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.get("/videos", getVideos);
router.post("/videos", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), createVideo);
router.put("/videos/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), updateVideo);
router.delete("/videos/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), deleteVideo);

export default router;
