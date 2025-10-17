import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ customer: req.user._id }).populate({
    path: "items.product",
    populate: {
      path: "category supplier",
      select: "name firstname lastname businessName",
    },
  });

  if (!cart) {
    cart = await Cart.create({
      customer: req.user._id,
      items: [],
      totalAmount: 0,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart fetched successfully", cart));
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Verify product exists and is available
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isActive) {
    throw new ApiError(400, "Product is not available");
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ customer: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      customer: req.user._id,
      items: [],
    });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  const price = product.discountPrice || product.price;

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (product.stock < newQuantity) {
      throw new ApiError(400, `Only ${product.stock} items available in stock`);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price,
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    populate: {
      path: "category supplier",
      select: "name firstname lastname businessName",
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Item added to cart successfully", populatedCart)
    );
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ customer: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Verify stock availability
  const product = await Product.findById(item.product);

  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  item.quantity = quantity;
  item.price = product.discountPrice || product.price;

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    populate: {
      path: "category supplier",
      select: "name firstname lastname businessName",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart updated successfully", populatedCart));
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ customer: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    populate: {
      path: "category supplier",
      select: "name firstname lastname businessName",
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Item removed from cart successfully", populatedCart)
    );
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  cart.totalAmount = 0;

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Cart cleared successfully", cart));
});
