import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getCustomerReviews,
  getSupplierProductReviews,
} from "../controllers/review.controller.js";
import {
  verifyJWT,
  requireCustomer,
  requireSupplier,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Customer routes
router.post("/", verifyJWT, requireCustomer, createReview);
router.put("/:reviewId", verifyJWT, requireCustomer, updateReview);
router.delete("/:reviewId", verifyJWT, requireCustomer, deleteReview);
router.get(
  "/customer/my-reviews",
  verifyJWT,
  requireCustomer,
  getCustomerReviews
);

// Supplier routes
router.get(
  "/supplier/product-reviews",
  verifyJWT,
  requireSupplier,
  getSupplierProductReviews
);

export default router;
