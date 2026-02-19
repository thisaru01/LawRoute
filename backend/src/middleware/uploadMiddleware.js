// config/cloudinaryMulter.js
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");

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

module.exports = upload;
