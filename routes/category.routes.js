import { Router } from "express";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  toggleCategoryFeatured,
  deleteCategory,
  createSubCategory,
  deleteSubCategory
} from "../controllers/category.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.get("/categories", getCategories);
router.post("/categories", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), createCategory);
router.put("/categories/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), updateCategory);
router.patch("/categories/:id/toggle-featured", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), toggleCategoryFeatured);
router.delete("/categories/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), deleteCategory);

router.post("/subcategories", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), createSubCategory);
router.delete("/subcategories/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), deleteSubCategory);

export default router;
