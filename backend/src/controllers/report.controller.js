import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants.js";

// Generate supplier sales report
export const getSupplierSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, period = "daily" } = req.query;

  const matchQuery = {
    "items.supplier": req.user._id,
    status: ORDER_STATUS.DELIVERED,
  };

  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Overall statistics
  const overallStats = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    { $match: { "items.supplier": req.user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$items.subtotal" },
        totalQuantitySold: { $sum: "$items.quantity" },
        averageOrderValue: { $avg: "$items.subtotal" },
      },
    },
  ]);

  // Product-wise sales
  const productWiseSales = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    { $match: { "items.supplier": req.user._id } },
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
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  // Time-based sales trend
  let groupByFormat;
  switch (period) {
    case "daily":
      groupByFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      break;
    case "weekly":
      groupByFormat = { $week: "$createdAt" };
      break;
    case "monthly":
      groupByFormat = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
      break;
    default:
      groupByFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
  }

  const salesTrend = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    { $match: { "items.supplier": req.user._id } },
    {
      $group: {
        _id: groupByFormat,
        totalSales: { $sum: "$items.subtotal" },
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Supplier sales report generated successfully", {
      summary: overallStats[0] || {},
      productWiseSales,
      salesTrend,
    })
  );
});

// Generate supplier product performance report
export const getSupplierProductPerformance = asyncHandler(async (req, res) => {
  const products = await Product.find({ supplier: req.user._id })
    .populate("category", "name")
    .select("name price stock averageRating totalReviews isActive");

  // Get sales data for each product
  const productsWithSales = await Promise.all(
    products.map(async (product) => {
      const salesData = await Order.aggregate([
        {
          $match: {
            "items.product": product._id,
            status: ORDER_STATUS.DELIVERED,
          },
        },
        { $unwind: "$items" },
        { $match: { "items.product": product._id } },
        {
          $group: {
            _id: null,
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.subtotal" },
          },
        },
      ]);

      return {
        ...product.toObject(),
        totalSold: salesData[0]?.totalSold || 0,
        totalRevenue: salesData[0]?.totalRevenue || 0,
      };
    })
  );

  // Sort by revenue
  productsWithSales.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Product performance report generated successfully",
        productsWithSales
      )
    );
});

// Generate admin platform report
export const getAdminPlatformReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Orders statistics
  const orderStats = await Order.aggregate([
    { $match: { ...dateFilter, status: ORDER_STATUS.DELIVERED } },
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

  // Payment statistics
  const paymentStats = await Payment.aggregate([
    { $match: { ...dateFilter, status: PAYMENT_STATUS.COMPLETED } },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // Top suppliers
  const topSuppliers = await Order.aggregate([
    { $match: { ...dateFilter, status: ORDER_STATUS.DELIVERED } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.supplier",
        totalSales: { $sum: "$items.subtotal" },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "supplierInfo",
      },
    },
    { $unwind: "$supplierInfo" },
    {
      $project: {
        supplierId: "$_id",
        supplierName: {
          $concat: ["$supplierInfo.firstname", " ", "$supplierInfo.lastname"],
        },
        businessName: "$supplierInfo.businessName",
        totalSales: 1,
        totalOrders: 1,
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: { ...dateFilter, status: ORDER_STATUS.DELIVERED } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSales: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $project: {
        productId: "$_id",
        productName: "$productInfo.name",
        totalSales: 1,
        totalQuantity: 1,
        totalOrders: 1,
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  // Category-wise sales
  const categoryWiseSales = await Order.aggregate([
    { $match: { ...dateFilter, status: ORDER_STATUS.DELIVERED } },
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
        _id: "$categoryInfo._id",
        categoryName: { $first: "$categoryInfo.name" },
        totalSales: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Platform report generated successfully", {
      orderStats: orderStats[0] || {},
      paymentStats,
      topSuppliers,
      topProducts,
      categoryWiseSales,
    })
  );
});

// Generate customer order history report
export const getCustomerOrderReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchQuery = { customer: req.user._id };

  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Overall statistics
  const overallStats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$finalAmount" },
        averageOrderValue: { $avg: "$finalAmount" },
      },
    },
  ]);

  // Status-wise order count
  const statusWiseOrders = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$finalAmount" },
      },
    },
  ]);

  // Category-wise spending
  const categoryWiseSpending = await Order.aggregate([
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
        totalSpent: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Customer order report generated successfully", {
      summary: overallStats[0] || {},
      statusWiseOrders,
      categoryWiseSpending,
    })
  );
});
