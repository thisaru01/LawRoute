// config/cloudinaryMulter.js
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "law-route",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

// Create Multer instance using Cloudinary storage with size limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});

export default upload;
