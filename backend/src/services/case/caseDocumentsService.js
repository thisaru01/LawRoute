import Case from "../../models/case/caseModel.js";
import CaseDocument from "../../models/case/caseDocument.js";
import { cloudinary } from "../../config/cloudinary.js";

// Create a new document for a case (citizen or lawyer associated with the case)
export async function uploadCaseDocument({
  caseId,
  uploadedBy,
  fileUrl,
  fileType,
  filePublicId,
}) {
  const caseDoc = await Case.findById(caseId).select("user lawyer status");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  if (caseDoc.status === "closed") {
    const error = new Error("Cannot upload documents for a closed case");
    error.statusCode = 400;
    throw error;
  }

  const isUser =
    caseDoc.user && caseDoc.user.toString() === uploadedBy.toString();
  const isLawyer =
    caseDoc.lawyer && caseDoc.lawyer.toString() === uploadedBy.toString();

  if (!isUser && !isLawyer) {
    const error = new Error(
      "You are not allowed to upload documents for this case",
    );
    error.statusCode = 403;
    throw error;
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

  const document = await CaseDocument.create({
    caseId: caseDoc._id,
    uploadedBy,
    fileUrl,
    fileType,
    filePublicId,
    thumbnailUrl,
  });

  return document;
}

// Get all documents for a case (citizen or lawyer associated with the case)
export async function getCaseDocuments({ caseId, currentUserId }) {
  const caseDoc = await Case.findById(caseId).select("user lawyer");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  const isUser =
    caseDoc.user && caseDoc.user.toString() === currentUserId.toString();
  const isLawyer =
    caseDoc.lawyer && caseDoc.lawyer.toString() === currentUserId.toString();

  if (!isUser && !isLawyer) {
    const error = new Error(
      "You are not allowed to view documents for this case",
    );
    error.statusCode = 403;
    throw error;
  }

  const documents = await CaseDocument.find({ caseId })
    .populate("uploadedBy", "name email role")
    .sort({ createdAt: -1 });

  return documents;
}
