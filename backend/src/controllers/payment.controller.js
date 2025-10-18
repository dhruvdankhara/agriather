import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import { PAYMENT_STATUS, ORDER_STATUS, PAYMENT_METHOD } from "../constants.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
} from "../utils/razorpay.js";

// Create Razorpay order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ order: orderId });

  if (existingPayment && existingPayment.status === PAYMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "Payment already completed for this order");
  }

  // Create or get payment record
  let payment;
  if (existingPayment) {
    payment = existingPayment;
  } else {
    payment = await Payment.create({
      order: orderId,
      customer: req.user._id,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: PAYMENT_STATUS.PENDING,
    });
  }

  // For COD, mark as pending and return
  if (order.paymentMethod === PAYMENT_METHOD.COD) {
    return res.status(200).json(
      new ApiResponse(200, "Cash on Delivery order created", {
        payment,
        requiresPayment: false,
      })
    );
  }

  // Create Razorpay order
  try {
    const razorpayOrder = await createRazorpayOrder(
      order.totalAmount,
      "INR",
      order.orderNumber
    );

    // Update payment with Razorpay order details
    payment.paymentGatewayResponse = {
      razorpay_order_id: razorpayOrder.id,
      razorpay_order_created_at: razorpayOrder.created_at,
    };
    await payment.save();

    return res.status(200).json(
      new ApiResponse(200, "Payment order created successfully", {
        payment,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        requiresPayment: true,
      })
    );
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new ApiError(500, "Failed to create payment order");
  }
});

// Verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentId,
  } = req.body;

  const payment = await Payment.findById(paymentId).populate("order");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = "Invalid payment signature";
    await payment.save();

    throw new ApiError(400, "Payment verification failed");
  }

  try {
    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

    // Update payment status
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.paidAt = new Date();
    payment.paymentGatewayResponse = {
      ...payment.paymentGatewayResponse,
      razorpay_payment_id,
      razorpay_signature,
      payment_details: paymentDetails,
    };
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

    return res.status(200).json(
      new ApiResponse(200, "Payment verified successfully", {
        payment,
        order,
      })
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = error.message;
    await payment.save();

    throw new ApiError(500, "Payment verification failed");
  }
});

// Handle payment failure
export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { paymentId, error } = req.body;

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  payment.status = PAYMENT_STATUS.FAILED;
  payment.failureReason = error?.description || "Payment failed";
  payment.paymentGatewayResponse = {
    ...payment.paymentGatewayResponse,
    error,
  };
  await payment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment failure recorded", payment));
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
  const { page = 1, limit = 100, status } = req.query;

  // Get all orders that contain this supplier's items
  const orders = await Order.find({
    "items.supplier": req.user._id,
  })
    .select("_id items")
    .lean();

  const orderIds = orders.map((order) => order._id);

  if (orderIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No payments found", [])
    );
  }

  const query = {
    order: { $in: orderIds },
  };

  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate("order", "orderNumber items status")
    .populate("customer", "firstname lastname email")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .lean();

  // Calculate supplier's earnings from each payment
  const paymentsWithEarnings = payments.map((payment) => {
    // Find the full order data
    const fullOrder = orders.find(
      (o) => o._id.toString() === payment.order._id.toString()
    );

    // Filter items belonging to this supplier
    const supplierItems = fullOrder.items.filter(
      (item) => item.supplier.toString() === req.user._id.toString()
    );

    // Calculate earnings (subtotal for supplier's items)
    const supplierEarnings = supplierItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );

    // Map payment status to frontend expected format
    let statusLabel = "Processing";
    if (payment.status === PAYMENT_STATUS.COMPLETED || payment.status === "completed") {
      statusLabel = "Completed";
    } else if (payment.status === PAYMENT_STATUS.PENDING || payment.status === "pending") {
      statusLabel = "Pending";
    } else if (payment.status === PAYMENT_STATUS.FAILED || payment.status === "failed") {
      statusLabel = "Failed";
    }

    return {
      _id: payment._id,
      order: payment.order._id,
      orderNumber: payment.order.orderNumber,
      customer: payment.customer,
      amount: supplierEarnings, // Use supplier's portion as amount
      status: statusLabel,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      supplierEarnings,
      supplierItems: supplierItems.length,
    };
  });

  const count = await Payment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Supplier payment history fetched successfully",
      paymentsWithEarnings
    )
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
