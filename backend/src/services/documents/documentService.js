import mongoose from "mongoose";
import { cloudinary } from "../../config/cloudinary.js";
import Document from "../../models/documents/documentModel.js";

export const createDocument = async ({ title, description, user, fileUrl, filePublicId, fileType }) => {
  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  if (user.role !== "admin") {
    const err = new Error("Only admins can upload documents");
    err.status = 403;
    throw err;
  }

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
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid document id");
    err.status = 400;
    throw err;
  }

  const doc = await Document.findById(cleanId);
  if (!doc) {
    const err = new Error("Document not found");
    err.status = 404;
    throw err;
  }

  return doc;
};

export const updateDocument = async ({ id, title, description, user }) => {
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid document id");
    err.status = 400;
    throw err;
  }

  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  if (user.role !== "admin") {
    const err = new Error("Only admins can update documents");
    err.status = 403;
    throw err;
  }

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
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid document id");
    err.status = 400;
    throw err;
  }

  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  if (user.role !== "admin") {
    const err = new Error("Only admins can delete documents");
    err.status = 403;
    throw err;
  }

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
