import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { decodeToken } from "../utils/helper.js";
import User from "../models/user.model.js";
import { USER_ROLES } from "../constants.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  try {
    const payload = decodeToken(token);

    const user = await User.findById(payload._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid token - User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    throw new ApiError(403, "Forbidden: Admin access required");
  }
  next();
});

export const requireSupplier = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.SUPPLIER) {
    throw new ApiError(403, "Forbidden: Supplier access required");
  }

  if (!req.user.isApproved) {
    throw new ApiError(403, "Supplier account not approved yet");
  }
  next();
});

export const requireCustomer = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError(403, "Forbidden: Customer access required");
  }
  next();
});

export const requireSupplierOrAdmin = asyncHandler(async (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== USER_ROLES.SUPPLIER &&
      req.user.role !== USER_ROLES.ADMIN)
  ) {
    throw new ApiError(403, "Forbidden: Supplier or Admin access required");
  }

  if (req.user.role === USER_ROLES.SUPPLIER && !req.user.isApproved) {
    throw new ApiError(403, "Supplier account not approved yet");
  }
  next();
});

export const requireCustomerOrAdmin = asyncHandler(async (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== USER_ROLES.CUSTOMER &&
      req.user.role !== USER_ROLES.ADMIN)
  ) {
    throw new ApiError(403, "Forbidden: Customer or Admin access required");
  }
  next();
});
