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

  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({
    status: ORDER_STATUS.PENDING,
  });
  const completedOrders = await Order.countDocuments({
    status: ORDER_STATUS.DELIVERED,
  });

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });

  const totalReviews = await Review.countDocuments();

  return res.status(200).json(
    new ApiResponse(200, "Platform stats fetched successfully", {
      users: {
        totalCustomers,
        totalSuppliers,
        pendingSuppliers,
      },
      orders: {
        totalOrders,
        pendingOrders,
        completedOrders,
      },
      revenue: totalRevenue[0]?.total || 0,
      products: {
        totalProducts,
        activeProducts,
      },
      totalReviews,
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

  const salesReport = await Order.aggregate([
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
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Sales report generated successfully", {
      summary: salesReport[0] || {},
      categoryWiseSales,
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
