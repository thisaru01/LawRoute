import express from "express";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
  createPost,
  deletePost,
  getMyPosts,
  getPublicFeed,
  updatePost,
} from "../../controllers/social/postController.js";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../../validations/social/postValidation.js";

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

// Lawyer: update own post
router.put(
  "/posts/:id",
  protect,
  authorizeRoles("lawyer"),
  validateUpdatePost,
  updatePost,
);

// Lawyer: delete own post
router.delete("/posts/:id", protect, authorizeRoles("lawyer"), deletePost);

export default router;
