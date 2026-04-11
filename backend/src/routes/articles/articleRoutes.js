import express from "express";
import {
  createArticle,
  getAllArticles,
  getPublishedArticles,
  getArticle,
  getPendingOthersArticles,
  getMyArticles,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
} from "../../controllers/articles/articleController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import articleUpload from "../../middleware/upload/articleUpload.js";

const router = express.Router();

// Get all articles (public: only published; admin with token: all)
router.get("/", getAllArticles);

// Public: get only published articles
router.get("/published", getPublishedArticles);

// Get only the authenticated user's articles (owner), using token only
router.get("/me", protect, authorizeRoles("admin", "lawyer"), getMyArticles);

// Get single article by id
router.get("/:id", getArticle);

// Create article 
router.post(
  "/",
  protect,
  articleUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagecard", maxCount: 1 },
  ]),
  createArticle,
);

// Update article (only when status is 'pending')
// - Admins: any pending article
// - Lawyers: only their own pending articles
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "lawyer"),
  articleUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagecard", maxCount: 1 },
  ]),
  updateArticle,
);

// Admin-only: update article status (pending -> published)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "lawyer"),
  updateArticleStatus,
);

// Admin-only: list pending articles authored by others (includes lawyers' pending articles)
router.get(
  "/pending/others",
  protect,
  authorizeRoles("admin"),
  getPendingOthersArticles,
);

// Delete article
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "lawyer"),
  deleteArticle,
);

export default router;
