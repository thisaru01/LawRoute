import { createUpload } from "../uploadMiddleware.js";

export const caseDocumentUpload = createUpload({
  folder: "cases",
  allowedFormats: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
  maxFiles: 5,
  maxFileSize: 20 * 1024 * 1024,
});
