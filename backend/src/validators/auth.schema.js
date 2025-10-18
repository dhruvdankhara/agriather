import * as yup from "yup";
import { USER_ROLES } from "../constants.js";

export const registerSchema = yup.object({
  firstname: yup.string().required("First name is required").trim(),
  lastname: yup.string().required("Last name is required").trim(),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required")
    .lowercase()
    .trim(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  phone: yup.string().trim(),
  role: yup
    .string()
    .oneOf(
      [USER_ROLES.CUSTOMER, USER_ROLES.SUPPLIER],
      "Invalid role. Must be customer or supplier"
    )
    .default(USER_ROLES.CUSTOMER),
  // Supplier specific fields
  businessName: yup.string().when("role", {
    is: USER_ROLES.SUPPLIER,
    then: (schema) =>
      schema.required("Business name is required for suppliers"),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessAddress: yup.string().when("role", {
    is: USER_ROLES.SUPPLIER,
    then: (schema) =>
      schema.required("Business address is required for suppliers"),
    otherwise: (schema) => schema.notRequired(),
  }),
  gstNumber: yup.string().trim(),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const updateProfileSchema = yup.object({
  firstname: yup.string().trim(),
  lastname: yup.string().trim(),
  phone: yup.string().trim(),
  businessName: yup.string().trim(),
  businessAddress: yup.string().trim(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const shippingAddressSchema = yup.object({
  addressLine1: yup.string().required("Address line 1 is required").trim(),
  addressLine2: yup.string().trim(),
  city: yup.string().required("City is required").trim(),
  state: yup.string().required("State is required").trim(),
  pincode: yup.string().required("Pincode is required").trim(),
  country: yup.string().trim().default("India"),
  isDefault: yup.boolean().default(false),
});
