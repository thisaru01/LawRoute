import { createUpload } from "../uploadMiddleware.js";

const libraryDocumentUpload = createUpload({
  folder: "library-documents",
  allowedFormats: ["pdf", "doc", "docx", "txt"],
  maxFiles: 1,
  maxFileSize: 20 * 1024 * 1024,
});

export default libraryDocumentUpload;
