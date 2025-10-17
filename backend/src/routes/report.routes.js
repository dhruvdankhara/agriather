import express from "express";
import {
  getSupplierSalesReport,
  getSupplierProductPerformance,
  getAdminPlatformReport,
  getCustomerOrderReport,
} from "../controllers/report.controller.js";
import {
  verifyJWT,
  requireAdmin,
  requireSupplier,
  requireCustomer,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Supplier reports
router.get(
  "/supplier/sales",
  verifyJWT,
  requireSupplier,
  getSupplierSalesReport
);
router.get(
  "/supplier/products",
  verifyJWT,
  requireSupplier,
  getSupplierProductPerformance
);

// Admin reports
router.get("/admin/platform", verifyJWT, requireAdmin, getAdminPlatformReport);

// Customer reports
router.get(
  "/customer/orders",
  verifyJWT,
  requireCustomer,
  getCustomerOrderReport
);

export default router;
