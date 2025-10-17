import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants.js";

// Create order from cart
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, paymentMethod, notes } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ customer: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Get shipping address
  const shippingAddress = req.user.shippingAddresses.id(shippingAddressId);

  if (!shippingAddress) {
    throw new ApiError(404, "Shipping address not found");
  }

  // Prepare order items and verify stock
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product || !product.isActive) {
      throw new ApiError(
        400,
        `Product ${product?.name || "unknown"} is not available`
      );
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stock}`
      );
    }

    const price = product.discountPrice || product.price;
    const subtotal = price * item.quantity;

    orderItems.push({
      product: product._id,
      supplier: product.supplier,
      quantity: item.quantity,
      price,
      subtotal,
    });

    totalAmount += subtotal;

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Calculate tax and shipping
  const tax = totalAmount * 0.18; // 18% GST
  const shippingCharges = totalAmount > 500 ? 0 : 50; // Free shipping above 500
  const finalAmount = totalAmount + tax + shippingCharges;

  // Create order
  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    shippingAddress: {
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      country: shippingAddress.country,
    },
    totalAmount,
    tax,
    shippingCharges,
    finalAmount,
    notes,
    statusHistory: [
      {
        status: ORDER_STATUS.PENDING,
        timestamp: new Date(),
      },
    ],
  });

  // Create payment record
  const payment = await Payment.create({
    order: order._id,
    customer: req.user._id,
    amount: finalAmount,
    paymentMethod,
    status: PAYMENT_STATUS.PENDING,
  });

  order.paymentId = payment._id;
  await order.save();

  // Clear cart
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("items.product", "name images")
    .populate("items.supplier", "firstname lastname businessName")
    .populate("paymentId");

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Order created successfully", {
        order: populatedOrder,
        payment,
      })
    );
});

// Get customer's orders
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user._id };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate("items.product", "name images")
    .populate("items.supplier", "firstname lastname businessName")
    .populate("paymentId")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Order.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully", {
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalOrders: count,
    })
  );
});

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("customer", "firstname lastname email phone")
    .populate("items.product", "name images category")
    .populate("items.supplier", "firstname lastname businessName email phone")
    .populate("paymentId");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user has access to this order
  if (
    order.customer._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    !order.items.some(
      (item) => item.supplier.toString() === req.user._id.toString()
    )
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order fetched successfully", order));
});

// Cancel order (Customer)
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;

  const order = await Order.findById(orderId).populate("items.product");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only cancel your own orders");
  }

  if (
    order.status === ORDER_STATUS.SHIPPED ||
    order.status === ORDER_STATUS.DELIVERED ||
    order.status === ORDER_STATUS.CANCELLED
  ) {
    throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancellationReason = cancellationReason;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    timestamp: new Date(),
    note: cancellationReason,
  });

  await order.save();

  // Update payment status
  if (order.paymentId) {
    await Payment.findByIdAndUpdate(order.paymentId, {
      status: PAYMENT_STATUS.REFUNDED,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order cancelled successfully", order));
});

// Update order status (Supplier/Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Verify supplier has items in this order or user is admin
  if (req.user.role !== "admin") {
    const hasItems = order.items.some(
      (item) => item.supplier.toString() === req.user._id.toString()
    );

    if (!hasItems) {
      throw new ApiError(403, "Access denied");
    }
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
  });

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("customer", "firstname lastname email")
    .populate("items.product", "name")
    .populate("items.supplier", "firstname lastname businessName");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Order status updated successfully", populatedOrder)
    );
});

// Get supplier's orders
export const getSupplierOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {
    "items.supplier": req.user._id,
  };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate("customer", "firstname lastname email phone")
    .populate("items.product", "name images")
    .populate("paymentId")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Order.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Supplier orders fetched successfully", {
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalOrders: count,
    })
  );
});

// Track order (Customer)
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).select(
    "orderNumber status statusHistory createdAt"
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, "Order tracking fetched successfully", {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      statusHistory: order.statusHistory,
      orderDate: order.createdAt,
    })
  );
});
