import express from "express";
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getSupplierOrders,
  trackOrder,
} from "../controllers/order.controller.js";
import {
  verifyJWT,
  requireCustomer,
  requireSupplier,
  requireSupplierOrAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer routes
router.post("/", verifyJWT, requireCustomer, createOrder);
router.get(
  "/customer/my-orders",
  verifyJWT,
  requireCustomer,
  getCustomerOrders
);
router.get("/:orderId/track", verifyJWT, requireCustomer, trackOrder);
router.put("/:orderId/cancel", verifyJWT, requireCustomer, cancelOrder);

// Supplier routes
router.get(
  "/supplier/my-orders",
  verifyJWT,
  requireSupplier,
  getSupplierOrders
);

// Supplier/Admin routes
router.put(
  "/:orderId/status",
  verifyJWT,
  requireSupplierOrAdmin,
  updateOrderStatus
);

// Common routes (with access control in controller)
router.get("/:orderId", verifyJWT, getOrderById);

export default router;
