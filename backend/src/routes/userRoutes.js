import express from "express";
import { updateMe, updateProfilePhoto } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Update logged-in user's basic info (excluding profilePhoto image upload)
router.put("/me", protect, updateMe);

// Upload and update logged-in user's profile photo via Cloudinary
router.put(
  "/me/profile-photo",
  protect,
  upload.single("profilePhoto"),
  updateProfilePhoto,
);

export default router;
