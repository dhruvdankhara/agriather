import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Address from "../models/address.model.js";

// Get all addresses for the logged-in user
export const getUserAddresses = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const query = {
    user: req.user._id,
    isActive: true,
  };

  if (type) {
    query.type = type;
  }

  const addresses = await Address.find(query).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Addresses fetched successfully", addresses));
});

// Get address by ID
export const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Address fetched successfully", address));
});

// Create new address
export const createAddress = asyncHandler(async (req, res) => {
  const {
    type,
    label,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    country,
    phone,
    isDefault,
  } = req.body;

  // Check if user has any addresses
  const addressCount = await Address.countDocuments({
    user: req.user._id,
    isActive: true,
  });

  // If this is the first address, make it default
  const shouldBeDefault = addressCount === 0 ? true : isDefault || false;

  const address = await Address.create({
    user: req.user._id,
    type: type || "shipping",
    label,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    country: country || "India",
    phone,
    isDefault: shouldBeDefault,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Address created successfully", address));
});

// Update address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    type,
    label,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    country,
    phone,
    isDefault,
  } = req.body;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Update fields
  if (type) address.type = type;
  if (label) address.label = label;
  if (addressLine1) address.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
  if (landmark !== undefined) address.landmark = landmark;
  if (city) address.city = city;
  if (state) address.state = state;
  if (pincode) address.pincode = pincode;
  if (country) address.country = country;
  if (phone !== undefined) address.phone = phone;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await address.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Address updated successfully", address));
});

// Delete address (soft delete)
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Soft delete
  address.isActive = false;
  await address.save();

  // If this was the default address, make another one default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({
      user: req.user._id,
      type: address.type,
      isActive: true,
      _id: { $ne: address._id },
    }).sort({ createdAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Address deleted successfully", null));
});

// Set address as default
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Remove default from other addresses of the same type
  await Address.updateMany(
    {
      user: req.user._id,
      type: address.type,
      _id: { $ne: address._id },
    },
    { isDefault: false }
  );

  // Set this address as default
  address.isDefault = true;
  await address.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Default address set successfully", address));
});
