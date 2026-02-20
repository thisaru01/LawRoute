// config/cloudinaryMulter.js
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "peace-justice-app",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

// Create Multer instance using Cloudinary storage
const upload = multer({ storage });

export default upload;
