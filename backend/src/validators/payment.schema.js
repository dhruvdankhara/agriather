import * as yup from "yup";

export const processPaymentSchema = yup.object({
  paymentId: yup.string().required("Payment ID is required"),
  paymentDetails: yup.object().required("Payment details are required"),
});
