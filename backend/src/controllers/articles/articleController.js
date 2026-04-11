import * as articleService from "../../services/articles/articleService.js";


// Create article
export const createArticle = async (req, res, next) => {
  try {
    console.log("createArticle called - body:", req.body);
    console.log(
      "createArticle called - user:",
      req.user && { id: req.user._id, role: req.user.role },
    );

    const { title, content, category } = req.body;

    // Files come from multer.fields; each key is an array
    const imageFile = req.files?.image?.[0];
    const imagecardFile = req.files?.imagecard?.[0];

    const imageUrl = imageFile?.path || null;
    const imagePublicId = imageFile?.filename || null;

    const imagecardUrl = imagecardFile?.path || null;
    const imagecardPublicId = imagecardFile?.filename || null;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;
    if (!["admin", "lawyer"].includes(role)) {
      return res
        .status(403)
        .json({ message: "Only admins or lawyers can create articles" });
    }

    if (!title || !content || !category || !imagecardUrl || !imageUrl) {
      return res.status(400).json({ message: "Title, content, category, image, and imagecard files are required" });
    }

    const status = "pending";

      const article = await articleService.createArticle({
        title,
        content,
        category,
        user: req.user,
        imageUrl,
        imagePublicId,
        imagecardUrl,
        imagecardPublicId,
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

// Admin-only: get pending articles authored by others (exclude requester's own)
export const getPendingOthersArticles = async (req, res, next) => {
  try {
    const extraQuery = {};
    if (req.query.category) extraQuery.category = req.query.category;

    const articles = await articleService.getPendingOthersArticles({
      authHeader: req.headers.authorization,
      extraQuery,
    });

    return res.status(200).json({ success: true, count: articles.length, articles });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Public: get only published articles
export const getPublishedArticles = async (req, res, next) => {
  try {
    const query = { ...req.query, status: "published" };
    const articles = await articleService.getAllArticles({ authHeader: req.headers.authorization, query });

    return res.status(200).json({ success: true, count: articles.length, articles });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Get articles of the currently authenticated user (owner only)
export const getMyArticles = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const articles = await articleService.getAllArticles({
      authHeader: req.headers.authorization,
      query: { author: String(req.user._id) },
    });

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

// Get single article by id
export const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById({ id, authHeader: req.headers.authorization });
    return res.status(200).json({ success: true, article });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
};

// Update article content
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const imageFile = req.files?.image?.[0];
    const imagecardFile = req.files?.imagecard?.[0];

    const imageUrl = imageFile?.path || null;
    const imagePublicId = imageFile?.filename || null;

    const imagecardUrl = imagecardFile?.path || null;
    const imagecardPublicId = imagecardFile?.filename || null;
    const removeImage = req.body?.removeImage === "true" || req.body?.removeImage === true;
    const removeImagecard = req.body?.removeImagecard === "true" || req.body?.removeImagecard === true;

    const article = await articleService.updateArticle({
      id,
      user: req.user,
      title,
      content,
      category,
      imageUrl,
      imagePublicId,
      imagecardUrl,
      imagecardPublicId,
      removeImage,
      removeImagecard,
    });

    return res.status(200).json({ success: true, article });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};


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
