import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { ORDER_STATUS } from "../constants.js";

// Create review (Customer - only for delivered orders)
export const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, title, comment, images } = req.body;

  // Verify order is delivered and belongs to customer
  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
    status: ORDER_STATUS.DELIVERED,
  });

  if (!order) {
    throw new ApiError(404, "Order not found or not eligible for review");
  }

  // Verify product is in the order
  const orderHasProduct = order.items.some(
    (item) => item.product.toString() === productId
  );

  if (!orderHasProduct) {
    throw new ApiError(400, "Product not found in this order");
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    product: productId,
    customer: req.user._id,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  // Create review
  const review = await Review.create({
    product: productId,
    customer: req.user._id,
    order: orderId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: true,
  });

  // Update product rating
  await updateProductRating(productId);

  const populatedReview = await Review.findById(review._id)
    .populate("customer", "firstname lastname avatar")
    .populate("product", "name images");

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Review submitted successfully", populatedReview)
    );
});

// Update review (Customer - own reviews only)
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, images } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;
  if (images) review.images = images;

  await review.save();

  // Update product rating
  await updateProductRating(review.product);

  const populatedReview = await Review.findById(review._id)
    .populate("customer", "firstname lastname avatar")
    .populate("product", "name images");

  return res
    .status(200)
    .json(new ApiResponse(200, "Review updated successfully", populatedReview));
});

// Delete review (Customer - own reviews only)
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  const productId = review.product;

  await Review.findByIdAndDelete(reviewId);

  // Update product rating
  await updateProductRating(productId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Review deleted successfully", null));
});

// Get reviews by product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  const query = { product: productId };

  if (rating) {
    query.rating = Number(rating);
  }

  const reviews = await Review.find(query)
    .populate("customer", "firstname lastname avatar")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Review.countDocuments(query);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Product reviews fetched successfully", {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalReviews: count,
      ratingDistribution,
    })
  );
});

// Get customer's reviews
export const getCustomerReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ customer: req.user._id })
    .populate("product", "name images")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Review.countDocuments({ customer: req.user._id });

  return res.status(200).json(
    new ApiResponse(200, "Customer reviews fetched successfully", {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalReviews: count,
    })
  );
});

// Get supplier's product reviews
export const getSupplierProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Get supplier's products
  const products = await Product.find({ supplier: req.user._id }).select("_id");
  const productIds = products.map((p) => p._id);

  const reviews = await Review.find({ product: { $in: productIds } })
    .populate("customer", "firstname lastname avatar")
    .populate("product", "name images")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Review.countDocuments({ product: { $in: productIds } });

  return res.status(200).json(
    new ApiResponse(200, "Supplier product reviews fetched successfully", {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalReviews: count,
    })
  );
});

// Get reviewable products for an order
export const getOrderReviewableProducts = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Verify order is delivered and belongs to customer
  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
    status: ORDER_STATUS.DELIVERED,
  }).populate("items.product", "name images averageRating totalReviews");

  if (!order) {
    throw new ApiError(404, "Order not found or not eligible for review");
  }

  // Get existing reviews for this customer
  const existingReviews = await Review.find({
    customer: req.user._id,
    order: orderId,
  });

  const reviewedProductIds = new Set(
    existingReviews.map((r) => r.product.toString())
  );

  // Add review info to each product
  const productsWithReviewStatus = order.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
    canReview: !reviewedProductIds.has(item.product._id.toString()),
    existingReview: existingReviews.find(
      (r) => r.product.toString() === item.product._id.toString()
    ),
  }));

  return res.status(200).json(
    new ApiResponse(200, "Reviewable products fetched successfully", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      products: productsWithReviewStatus,
    })
  );
});

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: reviews.length,
  });
}
