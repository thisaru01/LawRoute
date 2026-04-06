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

// Create article (admins publish immediately; lawyers create pending articles)
// Get all articles (public: only published; admin with token: all)
router.get("/", getAllArticles);

// Public: get only published articles
router.get("/published", getPublishedArticles);


// Get only the authenticated user's articles (owner), using token only
// - Returns all statuses (pending, published, rejected, etc.) for that user
router.get("/me", protect, authorizeRoles("admin", "lawyer"), getMyArticles);

// Get single article by id (placed after /me to avoid conflicting with the '/me' route)
router.get("/:id", getArticle);

// Create article with optional image upload
// Accept both the main `image` and the `imagecard` upload fields
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

// Admin-only: update article status (e.g. pending -> published)
router.patch(
  "/:id/status",
  protect,
  // Allow both admins and lawyers to call the status endpoint; the
  // service enforces which roles may set which statuses (e.g., only
  // admins can publish/reject; only the author can archive).
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
// - Pending: admin or owning lawyer (enforced in controller)
// - Published: only admin who did NOT publish it (enforced in controller)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "lawyer"),
  deleteArticle,
);

export default router;
