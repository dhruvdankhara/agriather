import express from "express";
import {
  getPendingSuppliers,
  approveSupplier,
  deactivateSupplier,
  getAllSuppliers,
  getAllCustomers,
  getPlatformStats,
  getAllOrders,
  getAllPayments,
  getAllReviews,
  generateSalesReport,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/admin.controller.js";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyJWT, requireAdmin);

// Supplier management
router.get("/suppliers/pending", getPendingSuppliers);
router.get("/suppliers", getAllSuppliers);
router.put("/suppliers/:supplierId/approve", approveSupplier);
router.put("/suppliers/:supplierId/deactivate", deactivateSupplier);

// Customer management
router.get("/customers", getAllCustomers);

// Platform monitoring
router.get("/stats", getPlatformStats);
router.get("/orders", getAllOrders);
router.get("/payments", getAllPayments);
router.get("/reviews", getAllReviews);

// Reports
router.get("/reports/sales", generateSalesReport);

// Category management
router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

export default router;
