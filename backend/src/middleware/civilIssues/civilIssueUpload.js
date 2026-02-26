// middleware/civilIssues/civilIssueUpload.js
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "../../config/cloudinary.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// Rejects files whose MIME type is not in the allowed list before upload to Cloudinary
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only jpg, png, jpeg, and pdf are allowed."
            ),
            false
        );
    }
};

// Civil-issue-specific Cloudinary storage — files land in their own subfolder
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "law-route/civil-issues",
        allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    },
});

const civilIssueUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter,
});

export default civilIssueUpload;
