import { cloudinary } from "../../config/cloudinary.js";
import Document from "../../models/documents/documentModel.js";
import {
  ensureValidDocumentId,
  validateCreatePayload,
  validateUpdatePayload,
  validateDeletePayload,
} from "../../validations/documents/documentValidation.js";

export const createDocument = async ({ title, description, user, fileUrl, filePublicId, fileType }) => {
  validateCreatePayload({ user, title, fileUrl, filePublicId });

  let thumbnailUrl;

  // For PDFs, generate a Cloudinary image thumbnail of the first page
  if (fileType === "application/pdf" && filePublicId) {
    thumbnailUrl = cloudinary.url(filePublicId, {
      resource_type: "image",
      format: "jpg",
      page: 1,
      width: 600,
      height: 400,
      crop: "fill",
      quality: "auto",
    });
  }

  const doc = new Document({
    title,
    description,
    fileUrl,
    filePublicId,
    fileType,
    thumbnailUrl,
    uploadedBy: user._id,
  });

  await doc.save();
  return doc;
};

export const getAllDocuments = async () => {
  const docs = await Document.find().sort({ createdAt: -1 });
  return docs;
};

export const getDocumentById = async ({ id }) => {
  const cleanId = ensureValidDocumentId(id);

  const doc = await Document.findById(cleanId);
  if (!doc) {
    const err = new Error("Document not found");
    err.status = 404;
    throw err;
  }

  return doc;
};

export const updateDocument = async ({ id, title, description, user }) => {
  const cleanId = ensureValidDocumentId(id);
  validateUpdatePayload({ user });

  const doc = await Document.findById(cleanId);
  if (!doc) {
    const err = new Error("Document not found");
    err.status = 404;
    throw err;
  }

  if (title !== undefined) doc.title = title;
  if (description !== undefined) doc.description = description;

  await doc.save();
  return doc;
};
export const deleteDocument = async ({ id, user }) => {
  const cleanId = ensureValidDocumentId(id);
  validateDeletePayload({ user });

  const doc = await Document.findById(cleanId);
  if (!doc) {
    const err = new Error("Document not found");
    err.status = 404;
    throw err;
  }

  if (doc.filePublicId) {
    try {
      await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
    } catch (e) {
      console.error("Failed to delete document from Cloudinary", e);
    }
  }

  await doc.deleteOne();
  return { success: true, message: "Document deleted successfully" };
};

export default {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
