import { POST_TYPES } from "../../models/social/postModel.js";

const ALLOWED_VISIBILITY = ["public", "followers", "private"];

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

export const validateCreatePost = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = ["postType", "content", "visibility", "tags"];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (!body.postType || !POST_TYPES.includes(body.postType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid postType",
    });
  }

  if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
    return res.status(400).json({
      success: false,
      message: "content is required",
    });
  }

  if (body.visibility && !ALLOWED_VISIBILITY.includes(body.visibility)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visibility",
    });
  }

  if (body.tags && !Array.isArray(body.tags)) {
    return res.status(400).json({
      success: false,
      message: "tags must be an array",
    });
  }

  return next();
};
