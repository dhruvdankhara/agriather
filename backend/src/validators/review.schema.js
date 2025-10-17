import * as yup from "yup";

export const createReviewSchema = yup.object({
  productId: yup.string().required("Product ID is required"),
  orderId: yup.string().required("Order ID is required"),
  rating: yup
    .number()
    .required("Rating is required")
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: yup.string().trim(),
  comment: yup.string().required("Comment is required").trim(),
  images: yup.array().of(yup.string()),
});

export const updateReviewSchema = yup.object({
  rating: yup
    .number()
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: yup.string().trim(),
  comment: yup.string().trim(),
  images: yup.array().of(yup.string()),
});
