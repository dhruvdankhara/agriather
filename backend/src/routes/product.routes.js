import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getSupplierProducts,
  getProductReviews,
  getAllCategories,
  getCategoryById,
} from "../controllers/product.controller.js";
import {
  verifyJWT,
  requireSupplier,
  requireSupplierOrAdmin,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId", getCategoryById);
router.get("/:productId", getProductById);
router.get("/:productId/reviews", getProductReviews);

// Supplier routes
router.post(
  "/",
  verifyJWT,
  requireSupplier,
  upload.array("images", 5),
  createProduct
);
router.put(
  "/:productId",
  verifyJWT,
  requireSupplier,
  upload.array("images", 5),
  updateProduct
);
router.delete("/:productId", verifyJWT, requireSupplier, deleteProduct);
router.get(
  "/supplier/my-products",
  verifyJWT,
  requireSupplier,
  getSupplierProducts
);

export default router;
