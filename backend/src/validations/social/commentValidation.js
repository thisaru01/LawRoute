import mongoose from "mongoose";

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

export const validateCreateComment = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = ["content", "parentComment"];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
    return res.status(400).json({
      success: false,
      message: "content is required",
    });
  }

  if (
    body.parentComment &&
    !mongoose.Types.ObjectId.isValid(body.parentComment)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid parentComment id",
    });
  }

  return next();
};
