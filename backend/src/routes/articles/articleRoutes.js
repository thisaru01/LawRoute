import express from "express";
import {
  createArticle,
  getAllArticles,
  getMyArticles,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
} from "../../controllers/articles/articleController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

// Create article (admins publish immediately; lawyers create pending articles)
// Get all articles (public: only published; admin with token: all)
router.get("/", getAllArticles);

// Get only the authenticated user's articles (owner), using token only
// - Returns all statuses (pending, published, rejected, etc.) for that user
router.get("/me", protect, authorizeRoles("admin", "lawyer"), getMyArticles);

// Create article with optional image upload
router.post("/", protect, upload.single("image"), createArticle);

// Update article (only when status is 'pending')
// - Admins: any pending article
// - Lawyers: only their own pending articles
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "lawyer"),
  upload.single("image"),
  updateArticle,
);

// Admin-only: update article status (e.g. pending -> published)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateArticleStatus,
);

// Delete article
// - Pending: admin or owning lawyer (enforced in controller)
// - Published: only admin who did NOT publish it (enforced in controller)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "lawyer"),
  deleteArticle,
);

export default router;
