import { createUpload } from "../uploadMiddleware.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// Optional local MIME-type guard (in addition to Cloudinary's allowed_formats)
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only jpg, png, jpeg, and pdf are allowed."),
      false,
    );
  }
};

const civilIssueUpload = createUpload({
  folder: "civil-issues",
  allowedFormats: ["jpg", "png", "jpeg", "pdf"],
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024,
});

export const civilIssueArrayUpload = civilIssueUpload;

export default civilIssueUpload;
