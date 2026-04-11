import mongoose from "mongoose";

export function ensureValidDocumentId(id) {
  const cleanId = String(id).replace(/[<>]/g, "");
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid document id");
    err.status = 400;
    throw err;
  }
  return cleanId;
}

export function ensureUserAuthenticated(user) {
  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

export function ensureAdmin(user, action = "perform this action") {
  ensureUserAuthenticated(user);
  if (user.role !== "admin") {
    const err = new Error(`Only admins can ${action} documents`);
    err.status = 403;
    throw err;
  }
}

export function validateCreatePayload({ user, title, fileUrl, filePublicId }) {
  ensureAdmin(user, "upload");

  if (!title) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }

  if (!fileUrl || !filePublicId) {
    const err = new Error("PDF file is required");
    err.status = 400;
    throw err;
  }
}

export function validateUpdatePayload({ user }) {
  ensureAdmin(user, "update");
}

export function validateDeletePayload({ user }) {
  ensureAdmin(user, "delete");
}
