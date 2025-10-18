import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { USER_ROLES, ORDER_STATUS } from "../constants.js";

// Get pending supplier approvals
export const getPendingSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await User.find({
    role: USER_ROLES.SUPPLIER,
    isApproved: false,
    isActive: true,
  }).select("-password -forgotPasswordToken -verifyToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Pending suppliers fetched successfully", suppliers)
    );
});

// Approve supplier
export const approveSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;

  const supplier = await User.findById(supplierId);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  if (supplier.role !== USER_ROLES.SUPPLIER) {
    throw new ApiError(400, "User is not a supplier");
  }

  supplier.isApproved = true;
  await supplier.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Supplier approved successfully", supplier));
});

// Reject/Deactivate supplier
export const deactivateSupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;

  const supplier = await User.findById(supplierId);

  if (!supplier) {
    throw new ApiError(404, "Supplier not found");
  }

  if (supplier.role !== USER_ROLES.SUPPLIER) {
    throw new ApiError(400, "User is not a supplier");
  }

  supplier.isActive = false;
  await supplier.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Supplier deactivated successfully", supplier));
});

// Get all suppliers
export const getAllSuppliers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isApproved } = req.query;

  const query = { role: USER_ROLES.SUPPLIER };

  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { businessName: { $regex: search, $options: "i" } },
    ];
  }

  if (isApproved !== undefined) {
    query.isApproved = isApproved === "true";
  }

  const suppliers = await User.find(query)
    .select("-password -forgotPasswordToken -verifyToken")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Suppliers fetched successfully", {
      suppliers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalSuppliers: count,
    })
  );
});

// Get all customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = { role: USER_ROLES.CUSTOMER };

  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await User.find(query)
    .select("-password -forgotPasswordToken -verifyToken")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Customers fetched successfully", {
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCustomers: count,
    })
  );
});

// Monitor platform activity
export const getPlatformStats = asyncHandler(async (req, res) => {
  // User Statistics
  const totalCustomers = await User.countDocuments({
    role: USER_ROLES.CUSTOMER,
  });
  const totalSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    isApproved: true,
  });
  const pendingSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    isApproved: false,
  });
  const activeSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    isApproved: true,
    isActive: true,
  });

  // Calculate date ranges for time-based stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Time-based user stats
  const todayNewUsers = await User.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow },
  });
  const weekNewUsers = await User.countDocuments({
    createdAt: { $gte: weekAgo },
  });
  const monthNewUsers = await User.countDocuments({
    createdAt: { $gte: monthAgo },
  });

  // Order Statistics
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({
    status: ORDER_STATUS.PENDING,
  });
  const confirmedOrders = await Order.countDocuments({
    status: ORDER_STATUS.CONFIRMED,
  });
  const shippedOrders = await Order.countDocuments({
    status: ORDER_STATUS.SHIPPED,
  });
  const completedOrders = await Order.countDocuments({
    status: ORDER_STATUS.DELIVERED,
  });
  const cancelledOrders = await Order.countDocuments({
    status: ORDER_STATUS.CANCELLED,
  });

  // Time-based order stats
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow },
  });
  const weekOrders = await Order.countDocuments({
    createdAt: { $gte: weekAgo },
  });
  const monthOrders = await Order.countDocuments({
    createdAt: { $gte: monthAgo },
  });

  // Revenue Statistics
  const totalRevenue = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const todayRevenue = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const weekRevenue = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: weekAgo },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const monthRevenue = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: monthAgo },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Product Statistics
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const inactiveProducts = await Product.countDocuments({ isActive: false });

  // Low stock products (stock < 10)
  const lowStockProducts = await Product.countDocuments({
    stock: { $lt: 10, $gt: 0 },
    isActive: true,
  });

  // Out of stock products
  const outOfStockProducts = await Product.countDocuments({
    stock: 0,
    isActive: true,
  });

  // Products added this week
  const weekNewProducts = await Product.countDocuments({
    createdAt: { $gte: weekAgo },
  });

  // Review Statistics
  const totalReviews = await Review.countDocuments();
  const weekNewReviews = await Review.countDocuments({
    createdAt: { $gte: weekAgo },
  });

  // Average rating calculation
  const avgRating = await Review.aggregate([
    { $group: { _id: null, average: { $avg: "$rating" } } },
  ]);

  // Category Statistics
  const totalCategories = await Category.countDocuments();

  // Top categories by product count
  const topCategories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $project: {
        _id: 1,
        name: "$categoryInfo.name",
        productCount: "$count",
      },
    },
  ]);

  // Payment Statistics
  const totalPayments = await Payment.countDocuments();
  const completedPayments = await Payment.countDocuments({
    status: "completed",
  });
  const pendingPayments = await Payment.countDocuments({ status: "pending" });
  const failedPayments = await Payment.countDocuments({ status: "failed" });

  // Recent activity - last 5 orders
  const recentOrders = await Order.find()
    .populate("customer", "firstname lastname email")
    .sort({ createdAt: -1 })
    .limit(5)
    .select("orderNumber status finalAmount createdAt");

  // Recent reviews - last 5
  const recentReviews = await Review.find()
    .populate("customer", "firstname lastname")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .select("rating comment customer product createdAt");

  // Growth metrics (comparing this month vs last month)
  const lastMonthStart = new Date(monthAgo);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const lastMonthOrders = await Order.countDocuments({
    createdAt: { $gte: lastMonthStart, $lt: monthAgo },
  });

  const lastMonthRevenue = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: lastMonthStart, $lt: monthAgo },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const orderGrowth =
    lastMonthOrders > 0
      ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(2)
      : 0;

  const revenueGrowth =
    lastMonthRevenue[0]?.total > 0
      ? (
          ((monthRevenue[0]?.total - lastMonthRevenue[0]?.total) /
            lastMonthRevenue[0]?.total) *
          100
        ).toFixed(2)
      : 0;

  return res.status(200).json(
    new ApiResponse(200, "Platform stats fetched successfully", {
      users: {
        totalCustomers,
        totalSuppliers,
        activeSuppliers,
        pendingSuppliers,
        todayNewUsers,
        weekNewUsers,
        monthNewUsers,
      },
      orders: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        completedOrders,
        cancelledOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        orderGrowth: parseFloat(orderGrowth),
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        week: weekRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0,
        revenueGrowth: parseFloat(revenueGrowth),
      },
      products: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        lowStockProducts,
        outOfStockProducts,
        weekNewProducts,
      },
      categories: {
        totalCategories,
        topCategories,
      },
      reviews: {
        totalReviews,
        weekNewReviews,
        averageRating: avgRating[0]?.average || 0,
      },
      payments: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
      },
      recentActivity: {
        orders: recentOrders,
        reviews: recentReviews,
      },
    })
  );
});

// Get all orders (admin view)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, customerId, supplierId } = req.query;

  const query = {};

  if (status) query.status = status;
  if (customerId) query.customer = customerId;
  if (supplierId) query["items.supplier"] = supplierId;

  const orders = await Order.find(query)
    .populate("customer", "firstname lastname email")
    .populate("items.product", "name")
    .populate("items.supplier", "firstname lastname businessName")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Order.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Orders fetched successfully", {
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
    })
  );
});

// Get all payments (admin view)
export const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate("customer", "firstname lastname email")
    .populate("order", "orderNumber totalAmount")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Payment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Payments fetched successfully", {
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPayments: count,
    })
  );
});

// Get all reviews/feedback
export const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, productId } = req.query;

  const query = {};
  if (productId) query.product = productId;

  const reviews = await Review.find(query)
    .populate("customer", "firstname lastname avatar")
    .populate("product", "name images")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Review.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Reviews fetched successfully", {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count,
    })
  );
});

// Generate sales report
export const generateSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, supplierId } = req.query;

  const matchQuery = {
    status: ORDER_STATUS.DELIVERED,
  };

  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (supplierId) {
    matchQuery["items.supplier"] = supplierId;
  }

  // Overall sales summary
  const salesSummary = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$finalAmount" },
        totalTax: { $sum: "$tax" },
        totalShipping: { $sum: "$shippingCharges" },
        averageOrderValue: { $avg: "$finalAmount" },
      },
    },
  ]);

  // Category-wise sales
  const categoryWiseSales = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$categoryInfo.name",
        totalSales: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$items.product",
        productName: { $first: "$productInfo.name" },
        totalSales: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  // Daily sales trend (if date range provided)
  let salesTrend = [];
  if (startDate && endDate) {
    salesTrend = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$finalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  return res.status(200).json(
    new ApiResponse(200, "Sales report generated successfully", {
      summary: salesSummary[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalTax: 0,
        averageOrderValue: 0,
      },
      categoryWiseSales,
      topProducts,
      salesTrend,
    })
  );
});

// Manage categories - Create
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    image,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", category));
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, image, isActive } = req.body;

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { $set: { name, description, image, isActive } },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Category updated successfully", category));
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Check if any products use this category
  const productsCount = await Product.countDocuments({ category: categoryId });

  if (productsCount > 0) {
    throw new ApiError(400, "Cannot delete category with associated products");
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Category deleted successfully", null));
});
