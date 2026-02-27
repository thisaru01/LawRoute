import * as articleService from "../../services/articles/articleService.js";


// Create article
// - Admins: article is immediately published
// - Lawyers: article is created with status 'pending' and must be approved by admin
// Expects `req.user` populated by authentication middleware with fields: `_id`, `role`
export const createArticle = async (req, res, next) => {
  try {
    console.log("createArticle called - body:", req.body);
    console.log(
      "createArticle called - user:",
      req.user && { id: req.user._id, role: req.user.role },
    );

    const { title, content, category } = req.body;

    const imageUrl = req.file?.path || null;
    const imagePublicId = req.file?.filename || null;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;
    if (!["admin", "lawyer"].includes(role)) {
      return res
        .status(403)
        .json({ message: "Only admins or lawyers can create articles" });
    }

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // All articles start as "pending" now, even for admins
    const status = "pending";

      const article = await articleService.createArticle({
        title,
        content,
        category,
        user: req.user,
        imageUrl,
        imagePublicId,
      });

      console.log("article saved:", article._id, "status:", article.status);
      return res.status(201).json({ message: "Article submitted for admin review.", article });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Get all articles
// - Public: returns only published articles
// - Admin (with valid Bearer token): returns all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles({ authHeader: req.headers.authorization, query: req.query });

    return res.status(200).json({ success: true, count: articles.length, articles });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Update article content/metadata
// - Only for articles with status 'pending'
// - Admins: can update any pending article
// - Lawyers: can update only their own pending articles
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const imageUrl = req.file?.path || null;
    const imagePublicId = req.file?.filename || null;

    const article = await articleService.updateArticle({
      id,
      user: req.user,
      title,
      content,
      category,
      imageUrl,
      imagePublicId,
    });

    return res.status(200).json({ success: true, article });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// export bottom of file (includes updateArticleStatus)

// Update article status (admin only)
export const updateArticleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await articleService.updateArticleStatus({ id, status, user: req.user });
    if (result.deleted) {
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(200).json({ success: true, article: result.article });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Delete article
// - Pending status:
//   * Admin can delete any pending article
//   * Lawyer can delete only their own pending article
// - Published status:
//   * Only admin can delete, and only if they are NOT the admin who published it
// - Other statuses:
//   * Only admin can delete
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await articleService.deleteArticle({ id, user: req.user });
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
