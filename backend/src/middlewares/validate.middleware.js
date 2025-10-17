import ApiError from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    next();
  } catch (error) {
    const errors = error.inner?.map((err) => ({
      field: err.path,
      message: err.message,
    }));

    const errorMessage =
      errors?.map((e) => e.message).join(", ") || error.message;

    next(new ApiError(400, errorMessage, errors));
  }
};
