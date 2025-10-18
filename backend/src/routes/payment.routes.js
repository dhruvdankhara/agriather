import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentById,
  getCustomerPayments,
  getSupplierPayments,
  getPaymentInvoice,
} from "../controllers/payment.controller.js";
import {
  verifyJWT,
  requireCustomer,
  requireSupplier,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer routes
router.post("/create-order", verifyJWT, requireCustomer, createPaymentOrder);
router.post("/verify", verifyJWT, requireCustomer, verifyPayment);
router.post("/failure", verifyJWT, requireCustomer, handlePaymentFailure);
router.get(
  "/customer/history",
  verifyJWT,
  requireCustomer,
  getCustomerPayments
);
router.get("/:paymentId/invoice", verifyJWT, getPaymentInvoice);

// Supplier routes
router.get(
  "/supplier/history",
  verifyJWT,
  requireSupplier,
  getSupplierPayments
);

// Common routes (with access control in controller)
router.get("/:paymentId", verifyJWT, getPaymentById);

export default router;
