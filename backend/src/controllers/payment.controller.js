import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import { PAYMENT_STATUS, ORDER_STATUS } from "../constants.js";

// Process payment (Mock implementation - integrate with actual payment gateway)
export const processPayment = asyncHandler(async (req, res) => {
  const { paymentId, paymentDetails } = req.body;

  const payment = await Payment.findById(paymentId).populate("order");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "Payment already completed");
  }

  // Mock payment processing
  // In production, integrate with Razorpay, Stripe, etc.
  try {
    // Simulate payment gateway response
    const mockGatewayResponse = {
      gatewayTransactionId: `GTW${Date.now()}`,
      status: "success",
      timestamp: new Date(),
      ...paymentDetails,
    };

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.paidAt = new Date();
    payment.paymentGatewayResponse = mockGatewayResponse;

    await payment.save();

    // Update order status
    const order = await Order.findById(payment.order._id);
    order.status = ORDER_STATUS.CONFIRMED;
    order.statusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      timestamp: new Date(),
      note: "Payment completed successfully",
    });
    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment processed successfully", payment));
  } catch (error) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = error.message;
    await payment.save();

    throw new ApiError(500, "Payment processing failed");
  }
});

// Get payment details
export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate("customer", "firstname lastname email")
    .populate("order", "orderNumber totalAmount items");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Check access
  if (
    payment.customer._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment fetched successfully", payment));
});

// Get customer's payment history
export const getCustomerPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user._id };

  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate("order", "orderNumber totalAmount")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Payment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Payment history fetched successfully", {
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPayments: count,
    })
  );
});

// Get supplier's payment history
export const getSupplierPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  // Get orders where supplier has products
  const orders = await Order.find({
    "items.supplier": req.user._id,
    status: ORDER_STATUS.DELIVERED,
  }).select("_id");

  const orderIds = orders.map((order) => order._id);

  const query = {
    order: { $in: orderIds },
  };

  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate("order", "orderNumber items")
    .populate("customer", "firstname lastname email")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  // Calculate supplier's earnings from each payment
  const paymentsWithEarnings = payments.map((payment) => {
    const order = payment.order;
    const supplierItems = order.items.filter(
      (item) => item.supplier.toString() === req.user._id.toString()
    );

    const supplierEarnings = supplierItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return {
      ...payment.toObject(),
      supplierEarnings,
      supplierItems: supplierItems.length,
    };
  });

  const count = await Payment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Supplier payment history fetched successfully", {
      payments: paymentsWithEarnings,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPayments: count,
    })
  );
});

// Get payment invoice/receipt
export const getPaymentInvoice = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate("customer", "firstname lastname email phone shippingAddresses")
    .populate({
      path: "order",
      populate: {
        path: "items.product items.supplier",
        select: "name images businessName gstNumber",
      },
    });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Check access
  if (
    payment.customer._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "Payment not completed yet");
  }

  // Return invoice data (frontend can generate PDF)
  const invoiceData = {
    invoiceNumber: `INV-${payment.transactionId}`,
    invoiceDate: payment.paidAt,
    payment,
    order: payment.order,
    customer: payment.customer,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Invoice fetched successfully", invoiceData));
});
