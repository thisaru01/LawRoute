import Article from "../models/articleModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import mongoose from "mongoose";

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

    const article = new Article({
      title,
      content,
      category,
      author: req.user._id,
      authorRole: role,
      status,
    });

    await article.save();
    console.log("article saved:", article._id, "status:", article.status);

    const message = "Article submitted for admin review.";

    return res.status(201).json({ message, article });
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
    let isAdmin = false;
    let adminId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("role");
        if (user && user.role === "admin") {
          isAdmin = true;
          adminId = decoded.id;
        }
      } catch (e) {
        // Invalid token - ignore and treat as unauthenticated
      }
    }

    const filter = {};
    // Status handling: allow admins to request any status via ?status=...
    if (req.query.status) {
      if (req.query.status !== "published" && !isAdmin) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
      filter.status = req.query.status;
    } else if (!isAdmin) {
      filter.status = "published";
    }

    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;

    // For admins, never show articles they authored themselves
    let queryFilter = { ...filter };
    if (isAdmin && adminId) {
      if (queryFilter.author && typeof queryFilter.author === "object") {
        queryFilter.author = { ...queryFilter.author, $ne: adminId };
      } else if (queryFilter.author) {
        queryFilter.author = { $eq: queryFilter.author, $ne: adminId };
      } else {
        queryFilter.author = { $ne: adminId };
      }
    } else {
      queryFilter = filter;
    }

    const articles = await Article.find(queryFilter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: articles.length, articles });
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

    // strip angle brackets if client included them (e.g. <id>)
    const cleanId = String(id).replace(/[<>]/g, "");

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid article id" });
    }

    if (!["pending", "published", "rejected", "archived"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const article = await Article.findById(cleanId);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    article.status = status;

    // Track which admin published the article, and clear when not published
    if (status === "published") {
      article.publishedBy = req.user ? req.user._id : null;
    } else {
      article.publishedBy = null;
    }
    await article.save();

    return res.status(200).json({ success: true, article });
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

    const cleanId = String(id).replace(/[<>]/g, "");

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid article id" });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const article = await Article.findById(cleanId);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    const userId = String(req.user._id);
    const isAdmin = req.user.role === "admin";
    const isLawyer = req.user.role === "lawyer";

    // Permission logic based on status
    if (article.status === "pending") {
      // Admin: can delete any pending article
      // Lawyer: can delete only own pending article
      if (isAdmin) {
        // allowed
      } else if (isLawyer && String(article.author) === userId) {
        // allowed
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Only admins or the article's lawyer author can delete pending articles",
        });
      }
    } else if (article.status === "published") {
      // Only admin, and not the same admin who published it
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only admins can delete published articles",
        });
      }

      if (
        article.publishedBy &&
        String(article.publishedBy) === userId
      ) {
        return res.status(403).json({
          success: false,
          message: "The admin who published this article cannot delete it",
        });
      }
    } else {
      // For rejected/archived or any other status: only admins can delete
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only admins can delete articles with this status",
        });
      }
    }

    await article.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
