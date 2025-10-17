import * as yup from "yup";

export const addToCartSchema = yup.object({
  productId: yup.string().required("Product ID is required"),
  quantity: yup
    .number()
    .required("Quantity is required")
    .integer("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = yup.object({
  quantity: yup
    .number()
    .required("Quantity is required")
    .integer("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});
