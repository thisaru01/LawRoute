import express from "express";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
  createPost,
  getMyPosts,
  getPublicFeed,
} from "../../controllers/social/postController.js";
import { validateCreatePost } from "../../validations/social/postValidation.js";

const router = express.Router();

// Public: read legal social feed
router.get("/posts", getPublicFeed);

// Lawyer: read own posts (including private/followers)
router.get("/posts/me", protect, authorizeRoles("lawyer"), getMyPosts);

// Lawyer: create legal social post
router.post(
  "/posts",
  protect,
  authorizeRoles("lawyer"),
  validateCreatePost,
  createPost,
);

export default router;
