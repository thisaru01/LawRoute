import { createUpload } from "../uploadMiddleware.js";

const articleUpload = createUpload({
  folder: "articles",
  allowedFormats: ["jpg", "jpeg", "png", "pdf"],
  maxFiles: 1,
  maxFileSize: 5 * 1024 * 1024,
});

export default articleUpload;
