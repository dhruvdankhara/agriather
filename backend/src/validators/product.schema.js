import * as yup from "yup";

export const createProductSchema = yup.object({
  name: yup.string().required("Product name is required").trim(),
  description: yup.string().required("Description is required").trim(),
  category: yup.string().required("Category is required"),
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive"),
  discountPrice: yup
    .number()
    .positive("Discount price must be positive")
    .test(
      "is-less-than-price",
      "Discount price must be less than price",
      function (value) {
        if (!value) return true;
        return value < this.parent.price;
      }
    ),
  stock: yup
    .number()
    .required("Stock is required")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  unit: yup.string().required("Unit is required").trim(),
  images: yup.array().of(yup.string()),
  specifications: yup.object(),
  tags: yup.array().of(yup.string()),
});

export const updateProductSchema = yup.object({
  name: yup.string().trim(),
  description: yup.string().trim(),
  category: yup.string(),
  price: yup.number().positive("Price must be positive"),
  discountPrice: yup
    .number()
    .positive("Discount price must be positive")
    .test(
      "is-less-than-price",
      "Discount price must be less than price",
      function (value) {
        if (!value) return true;
        if (!this.parent.price) return true;
        return value < this.parent.price;
      }
    ),
  stock: yup
    .number()
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  unit: yup.string().trim(),
  images: yup.array().of(yup.string()),
  specifications: yup.object(),
  tags: yup.array().of(yup.string()),
  isActive: yup.boolean(),
});

export const createCategorySchema = yup.object({
  name: yup.string().required("Category name is required").trim(),
  description: yup.string().trim(),
  image: yup.string(),
});

export const updateCategorySchema = yup.object({
  name: yup.string().trim(),
  description: yup.string().trim(),
  image: yup.string(),
  isActive: yup.boolean(),
});
