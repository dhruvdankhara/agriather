import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { USER_ROLES } from "../constants.js";

// Register new user (Customer or Supplier)
export const register = asyncHandler(async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    phone,
    role,
    businessName,
    businessAddress,
    gstNumber,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Prepare user data
  const userData = {
    firstname,
    lastname,
    email,
    password,
    phone,
    role: role || USER_ROLES.CUSTOMER,
  };

  // Add supplier-specific fields if role is supplier
  if (role === USER_ROLES.SUPPLIER) {
    userData.businessName = businessName;
    userData.businessAddress = businessAddress;
    userData.gstNumber = gstNumber;
    userData.isApproved = false; // Needs admin approval
  }

  const user = await User.create(userData);

  const createdUser = await User.findById(user._id).select(
    "-password -forgotPasswordToken -verifyToken"
  );

  if (role === USER_ROLES.SUPPLIER) {
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Supplier registered successfully. Waiting for admin approval.",
          createdUser
        )
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if supplier is approved
  if (user.role === USER_ROLES.SUPPLIER && !user.isApproved) {
    throw new ApiError(403, "Your supplier account is pending admin approval");
  }

  const token = user.generateAccessToken();

  const loggedInUser = await User.findById(user._id).select(
    "-password -forgotPasswordToken -verifyToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(200, "Logged in successfully", {
        user: loggedInUser,
        token,
      })
    );
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, "Logged out successfully", null));
});

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -forgotPasswordToken -verifyToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstname, lastname, phone, businessName, businessAddress } =
    req.body;

  const updateData = {
    firstname,
    lastname,
    phone,
  };

  // If supplier, allow updating business info
  if (req.user.role === USER_ROLES.SUPPLIER) {
    if (businessName) updateData.businessName = businessName;
    if (businessAddress) updateData.businessAddress = businessAddress;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password -forgotPasswordToken -verifyToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", user));
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully", null));
});

// Update avatar
export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload to cloudinary (if configured)
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // For now, just store the local path
  const avatar = avatarLocalPath;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar } },
    { new: true }
  ).select("-password -forgotPasswordToken -verifyToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

// Add shipping address (Customer only)
export const addShippingAddress = asyncHandler(async (req, res) => {
  const {
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user._id);

  // If this is set as default, unset other defaults
  if (isDefault) {
    user.shippingAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.shippingAddresses.push({
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country: country || "India",
    isDefault: isDefault || user.shippingAddresses.length === 0,
  });

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Address added successfully", user.shippingAddresses)
    );
});

// Update shipping address
export const updateShippingAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user._id);

  const address = user.shippingAddresses.id(addressId);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    user.shippingAddresses.forEach((addr) => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  address.addressLine1 = addressLine1 || address.addressLine1;
  address.addressLine2 = addressLine2 || address.addressLine2;
  address.city = city || address.city;
  address.state = state || address.state;
  address.pincode = pincode || address.pincode;
  address.country = country || address.country;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Address updated successfully",
        user.shippingAddresses
      )
    );
});

// Delete shipping address
export const deleteShippingAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);

  user.shippingAddresses = user.shippingAddresses.filter(
    (addr) => addr._id.toString() !== addressId
  );

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Address deleted successfully",
        user.shippingAddresses
      )
    );
});
