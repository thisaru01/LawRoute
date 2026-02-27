import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

export const createUpload = ({
  folder,
  allowedFormats,
  maxFiles = 1,
  maxFileSize = 5 * 1024 * 1024,
} = {}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: folder ? `law-route/${folder}` : "law-route",
      resource_type: "auto",
      allowed_formats: allowedFormats,
    }),
  });

  return multer({
    storage,
    limits: {
      files: maxFiles,
      fileSize: maxFileSize,
    },
  });
};

// Default uploader to keep existing imports working
const upload = createUpload({
  allowedFormats: ["jpg", "png", "jpeg", "pdf"],
});

export default upload;
