import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "law-route/posts",
    resource_type: "auto",
    allowed_formats: [
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
  }),
});

const postUpload = multer({
  storage,
  limits: {
    files: 5,
    fileSize: 20 * 1024 * 1024,
  },
});

export default postUpload;
