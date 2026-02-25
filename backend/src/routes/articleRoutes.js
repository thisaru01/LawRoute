import express from "express";
import {
  createArticle,
  getAllArticles,
  updateArticleStatus,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create article (admins publish immediately; lawyers create pending articles)
// Get all articles (public: only published; admin with token: all)
router.get("/", getAllArticles);

// Create article with optional image upload
router.post("/", protect, upload.single("image"), createArticle);

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
