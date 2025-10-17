import * as yup from "yup";
import { ORDER_STATUS, PAYMENT_METHOD } from "../constants.js";

export const createOrderSchema = yup.object({
  shippingAddressId: yup.string().required("Shipping address is required"),
  paymentMethod: yup
    .string()
    .required("Payment method is required")
    .oneOf(Object.values(PAYMENT_METHOD), "Invalid payment method"),
  notes: yup.string().trim(),
});

export const cancelOrderSchema = yup.object({
  cancellationReason: yup
    .string()
    .required("Cancellation reason is required")
    .trim(),
});

export const updateOrderStatusSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(Object.values(ORDER_STATUS), "Invalid order status"),
  note: yup.string().trim(),
});
