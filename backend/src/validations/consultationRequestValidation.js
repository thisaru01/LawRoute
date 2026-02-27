import mongoose from "mongoose";

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

export const validateCreateConsultationRequest = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = ["summary", "lawyerId"];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (
    !body.summary ||
    typeof body.summary !== "string" ||
    !body.summary.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "summary is required",
    });
  }

  if (body.summary.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "summary must not exceed 2000 characters",
    });
  }

  if (!body.lawyerId) {
    return res.status(400).json({
      success: false,
      message: "lawyerId is required",
    });
  }

  if (
    typeof body.lawyerId !== "string" ||
    !mongoose.Types.ObjectId.isValid(body.lawyerId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid lawyerId",
    });
  }

  return next();
};

export const validateUpdateConsultationRequest = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = ["summary"];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (
    !body.summary ||
    typeof body.summary !== "string" ||
    !body.summary.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "summary is required",
    });
  }

  if (body.summary.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "summary must not exceed 2000 characters",
    });
  }

  return next();
};
