import { createUpload } from "../uploadMiddleware.js";

const articleUpload = createUpload({
  folder: "articles",
  allowedFormats: ["jpg", "jpeg", "png", "pdf"],
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024,
});

export default articleUpload;
