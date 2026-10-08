import { Router } from "express";
import { 
  getProducts, 
  getProductById, 
  checkProductSku,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/product.controller.js";
import { verifyToken, checkRole } from "../middlewares/authJwt.js";

const router = Router();

router.get("/products", getProducts);
router.get("/products/check-sku/:sku", checkProductSku);
router.get("/products/:id", getProductById);
router.post("/products", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), createProduct);
router.put("/products/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), updateProduct);
router.delete("/products/:id", verifyToken, checkRole(["SUPER_ADMIN", "INVENTORY_MANAGER", "admin"]), deleteProduct);

export default router;
