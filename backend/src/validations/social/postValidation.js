import { POST_TYPES } from "../../models/social/postModel.js";

const ALLOWED_VISIBILITY = ["public", "followers", "private"];

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

const normalizeStringArray = (arrayValue) => {
  if (Array.isArray(arrayValue)) {
    return arrayValue;
  }

  if (typeof arrayValue !== "string") {
    return null;
  }

  const trimmedValue = arrayValue.trim();

  if (!trimmedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedValue);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return trimmedValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return null;
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const lowered = value.trim().toLowerCase();

  if (lowered === "true") {
    return true;
  }

  if (lowered === "false") {
    return false;
  }

  return null;
};

const normalizeTags = (tagsValue) => {
  return normalizeStringArray(tagsValue);
};

const normalizeBody = (body) => {
  const normalized = { ...body };

  if (Object.prototype.hasOwnProperty.call(normalized, "tags")) {
    const normalizedTags = normalizeTags(normalized.tags);

    if (normalizedTags === null) {
      return null;
    }

    normalized.tags = normalizedTags;
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "removeMediaPublicIds")) {
    const normalizedIds = normalizeStringArray(normalized.removeMediaPublicIds);

    if (normalizedIds === null) {
      return null;
    }

    normalized.removeMediaPublicIds = normalizedIds;
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "replaceMedia")) {
    const normalizedBoolean = normalizeBoolean(normalized.replaceMedia);

    if (normalizedBoolean === null) {
      return null;
    }

    normalized.replaceMedia = normalizedBoolean;
  }

  return normalized;
};

export const validateCreatePost = (req, res, next) => {
  const body = normalizeBody(req.body);

  if (!body) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid body values. tags/removeMediaPublicIds must be arrays; replaceMedia must be true or false",
    });
  }

  req.body = body;

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

  const hasFiles = Array.isArray(req.files) && req.files.length > 0;

  if (
    (!body.content || typeof body.content !== "string" || !body.content.trim()) &&
    !hasFiles
  ) {
    return res.status(400).json({
      success: false,
      message: "content or media file is required",
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

export const validateUpdatePost = (req, res, next) => {
  const body = normalizeBody(req.body);

  if (!body) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid body values. tags/removeMediaPublicIds must be arrays; replaceMedia must be true or false",
    });
  }

  req.body = body;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  const allowedFields = [
    "postType",
    "content",
    "visibility",
    "tags",
    "removeMediaPublicIds",
    "replaceMedia",
  ];

  if (!hasOnlyAllowedKeys(body, allowedFields)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  const hasFiles = Array.isArray(req.files) && req.files.length > 0;

  if (Object.keys(body).length === 0 && !hasFiles) {
    return res.status(400).json({
      success: false,
      message: "At least one field or media file is required to update",
    });
  }

  if (body.postType && !POST_TYPES.includes(body.postType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid postType",
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "content") &&
    (typeof body.content !== "string" || !body.content.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "content must be a non-empty string",
    });
  }

  if (body.visibility && !ALLOWED_VISIBILITY.includes(body.visibility)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visibility",
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, "tags") && !Array.isArray(body.tags)) {
    return res.status(400).json({
      success: false,
      message: "tags must be an array",
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "removeMediaPublicIds") &&
    !Array.isArray(body.removeMediaPublicIds)
  ) {
    return res.status(400).json({
      success: false,
      message: "removeMediaPublicIds must be an array",
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "replaceMedia") &&
    typeof body.replaceMedia !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "replaceMedia must be true or false",
    });
  }

  return next();
};
