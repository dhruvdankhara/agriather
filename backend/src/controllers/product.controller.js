import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Review from "../models/review.model.js";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../utils/cloudinary.js";

// Create product (Supplier)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    stock,
    unit,
    specifications,
    tags,
  } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  // Upload images to Cloudinary
  let imageUrls = [];
  console.log("🚀 ~ createProduct ~ req.files:", req.files);
  console.log("🚀 ~ createProduct ~ req.body:", req.body);

  if (req.files && req.files.length > 0) {
    console.log(`📸 Uploading ${req.files.length} images to Cloudinary...`);
    const uploadedImages = await uploadMultipleImages(
      req.files,
      "agriather/products"
    );
    console.log("✅ Uploaded images:", uploadedImages);
    imageUrls = uploadedImages.map((img) => img.url);
  } else {
    console.log("⚠️ No images received in req.files");
  }

  const product = await Product.create({
    name,
    description: description || name, // Use name as description if not provided
    category,
    supplier: req.user._id,
    price,
    discountPrice,
    stock,
    unit: unit || "piece", // Default unit if not provided
    images: imageUrls,
    specifications: specifications ? JSON.parse(specifications) : {},
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
  });

  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name")
    .populate("supplier", "firstname lastname businessName");

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Product created successfully", populatedProduct)
    );
});

// Update product (Supplier - own products only)
export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    stock,
    unit,
    images,
    specifications,
    tags,
    isActive,
  } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user is the supplier of this product
  if (product.supplier.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own products");
  }

  // Verify category if being updated
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }
  }

  // Upload new images to Cloudinary if provided
  let newImageUrls = [];
  console.log("🚀 ~ updateProduct ~ req.files:", req.files);
  console.log("🚀 ~ updateProduct ~ req.body.images:", req.body.images);

  if (req.files && req.files.length > 0) {
    console.log(`📸 Uploading ${req.files.length} new images to Cloudinary...`);
    const uploadedImages = await uploadMultipleImages(
      req.files,
      "agriather/products"
    );
    console.log("✅ Uploaded new images:", uploadedImages);
    newImageUrls = uploadedImages.map((img) => img.url);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (category) updateData.category = category;
  if (price !== undefined) updateData.price = price;
  if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
  if (stock !== undefined) updateData.stock = stock;
  if (unit) updateData.unit = unit;

  // Handle images update
  let existingImages = [];
  if (images) {
    try {
      // Parse existing images if sent as JSON string
      existingImages = typeof images === "string" ? JSON.parse(images) : images;
      console.log("📸 Existing images to keep:", existingImages);
    } catch (e) {
      existingImages = [];
    }
  }

  // Combine existing images with newly uploaded ones
  if (existingImages.length > 0 || newImageUrls.length > 0) {
    updateData.images = [...existingImages, ...newImageUrls];
    console.log("📸 Final images array:", updateData.images);
  }

  if (specifications) updateData.specifications = specifications;
  if (tags) updateData.tags = tags;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate("category", "name")
    .populate("supplier", "firstname lastname businessName");

  return res
    .status(200)
    .json(new ApiResponse(200, "Product updated successfully", updatedProduct));
});

// Delete product (Supplier - own products only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user is the supplier of this product
  if (product.supplier.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own products");
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    // Extract public IDs from Cloudinary URLs
    const publicIds = product.images
      .filter((url) => url.includes("cloudinary.com"))
      .map((url) => {
        // Extract public_id from Cloudinary URL
        const parts = url.split("/");
        const fileWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const fileName = fileWithExt.split(".")[0];
        return `${folder}/${fileName}`;
      });

    if (publicIds.length > 0) {
      await deleteMultipleImages(publicIds);
    }
  }

  await Product.findByIdAndDelete(productId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully", null));
});

// Get all products (with filters)
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
    supplierId,
  } = req.query;

  const query = { isActive: true };

  // Category filter
  if (category) {
    query.category = category;
  }

  // Supplier filter
  if (supplierId) {
    query.supplier = supplierId;
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = order === "asc" ? 1 : -1;

  console.log("🚀 ~ product.controller.js:174 ~ query:", query);

  const products = await Product.find(query)
    .populate("category", "name")
    .populate("supplier", "firstname lastname businessName")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOptions);

  const count = await Product.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Products fetched successfully", {
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalProducts: count,
    })
  );
});

// Get single product
export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId)
    .populate("category", "name description")
    .populate("supplier", "firstname lastname businessName email phone");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product fetched successfully", product));
});

// Get supplier's own products
export const getSupplierProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = { supplier: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Product.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, "Supplier products fetched successfully", {
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalProducts: count,
    })
  );
});

// Get product reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ product: productId })
    .populate("customer", "firstname lastname avatar")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Review.countDocuments({ product: productId });

  return res.status(200).json(
    new ApiResponse(200, "Product reviews fetched successfully", {
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalReviews: count,
    })
  );
});

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched successfully", categories));
});

// Get category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get products count in this category
  const productsCount = await Product.countDocuments({
    category: categoryId,
    isActive: true,
  });

  return res.status(200).json(
    new ApiResponse(200, "Category fetched successfully", {
      ...category.toObject(),
      productsCount,
    })
  );
});
