import express from "express";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import postUpload from "../../middleware/postUploadMiddleware.js";
import {
  createPost,
  deletePost,
  getFeed,
  getFeedForLoggedUser,
  getLawyerPosts,
  getMyPosts,
  getPublicFeed,
  updatePost,
} from "../../controllers/social/postController.js";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../../validations/social/postValidation.js";
import {
  likePost,
  unlikePost,
} from "../../controllers/social/postLikeController.js";

const router = express.Router();

// Public: read legal social feed
router.get("/posts", getPublicFeed);

// Public: read generic social feed endpoint
router.get("/feed", getFeed);

// Logged users: read feed
router.get("/feed/me", protect, getFeedForLoggedUser);

// Public: read public posts by lawyer
router.get("/lawyers/:lawyerId/posts", getLawyerPosts);

// Lawyer: read own posts (including private/followers)
router.get("/posts/me", protect, authorizeRoles("lawyer"), getMyPosts);

// Lawyer: create legal social post
router.post(
  "/posts",
  protect,
  authorizeRoles("lawyer"),
  postUpload.array("media", 5),
  validateCreatePost,
  createPost,
);

// Lawyer: update own post
router.put(
  "/posts/:id",
  protect,
  authorizeRoles("lawyer"),
  postUpload.array("media", 5),
  validateUpdatePost,
  updatePost,
);

// Lawyer: delete own post
router.delete("/posts/:id", protect, authorizeRoles("lawyer"), deletePost);

// Authenticated users: like a post
router.post("/posts/:id/like", protect, likePost);

// Authenticated users: unlike a post
router.delete("/posts/:id/like", protect, unlikePost);

export default router;
