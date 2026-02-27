import { createUpload } from "../uploadMiddleware.js";

export const lawyerPostUpload = createUpload({
  folder: "posts",
  allowedFormats: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "pdf",
    "doc",
    "docx",
    "txt",
    "mp4",
    "mov",
    "avi",
  ],
  maxFiles: 5,
  maxFileSize: 20 * 1024 * 1024,
});

export default lawyerPostUpload;
