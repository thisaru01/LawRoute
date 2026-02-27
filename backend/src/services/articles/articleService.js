import Article from "../../models/articles/articleModel.js";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import mongoose from "mongoose";
import { cloudinary } from "../../config/cloudinary.js";

const VALID_STATUSES = ["pending", "published", "rejected", "archived"];

export const createArticle = async ({
  title,
  content,
  category,
  user,
  imageUrl,
  imagePublicId,
}) => {
  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const role = user.role;
  if (!["admin", "lawyer"].includes(role)) {
    const err = new Error("Only admins or lawyers can create articles");
    err.status = 403;
    throw err;
  }

  if (!title || !content) {
    const err = new Error("Title and content are required");
    err.status = 400;
    throw err;
  }

  const status = "pending";

  const article = new Article({
    title,
    content,
    category,
    imageUrl: imageUrl || null,
    imagePublicId: imagePublicId || null,
    author: user._id,
    authorRole: role,
    status,
  });

  await article.save();
  return article;
};

export const getAllArticles = async ({ authHeader, query }) => {
  let isAdmin = false;
  let adminId = null;
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
      // ignore invalid token
    }
  }

  const filter = {};
  if (query.status) {
    if (query.status !== "published" && !isAdmin) {
      const err = new Error("Access denied");
      err.status = 403;
      throw err;
    }
    filter.status = query.status;
  } else if (!isAdmin) {
    filter.status = "published";
  }

  if (query.category) filter.category = query.category;
  if (query.author) filter.author = query.author;

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

  return articles;
};

export const updateArticleStatus = async ({ id, status, user }) => {
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid article id");
    err.status = 400;
    throw err;
  }

  if (!VALID_STATUSES.includes(status)) {
    const err = new Error("Invalid status");
    err.status = 400;
    throw err;
  }

  const article = await Article.findById(cleanId);
  if (!article) {
    const err = new Error("Article not found");
    err.status = 404;
    throw err;
  }

  // Guard: status changes are admin-only at the route level, but
  // we still enforce presence of a valid user object here.
  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  // Business rule for publishing:
  // - An admin may publish only OTHER admins' and lawyers' articles.
  // - An admin must NOT publish their own article.
  //   (e.g., admin1 can publish articles of admin2/3/4 and lawyers,
  //    but not articles authored by admin1.)

  // If admin is rejecting a pending article, remove it
  if (status === "rejected" && article.status === "pending") {
    await article.deleteOne();
    return { deleted: true, message: "Article rejected and removed from pending list" };
  }

  if (status === "published") {
    const publisherId = String(user._id);
    const authorId = String(article.author);

    // Disallow an admin publishing their own article
    if (publisherId === authorId) {
      const err = new Error("Admins cannot publish their own articles. Ask another admin to review and publish.");
      err.status = 403;
      throw err;
    }

    // At this point, the article's author is either another admin or a lawyer.
    article.publishedBy = user._id;
  } else {
    article.publishedBy = null;
  }

  article.status = status;
  await article.save();
  return { deleted: false, article };
};

export const updateArticle = async ({ id, user, title, content, category, imageUrl, imagePublicId }) => {
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid article id");
    err.status = 400;
    throw err;
  }

  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const role = user.role;
  if (!["admin", "lawyer"].includes(role)) {
    const err = new Error("Only admins or lawyers can update articles");
    err.status = 403;
    throw err;
  }

  const article = await Article.findById(cleanId);
  if (!article) {
    const err = new Error("Article not found");
    err.status = 404;
    throw err;
  }

  if (article.status !== "pending") {
    const err = new Error("Only pending articles can be updated");
    err.status = 400;
    throw err;
  }

  const userId = String(user._id);
  const isAdmin = role === "admin";
  const isLawyer = role === "lawyer";

  // Both admins and lawyers may only update their own pending articles
  if ((isAdmin || isLawyer) && String(article.author) !== userId) {
    const err = new Error("Only the article's author can update this pending article");
    err.status = 403;
    throw err;
  }

  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (category !== undefined) article.category = category;

  // Handle image replacement: if a new image is provided, remove the old one from Cloudinary
  if (imagePublicId) {
    if (article.imagePublicId && article.imagePublicId !== imagePublicId) {
      try {
        await cloudinary.uploader.destroy(article.imagePublicId);
      } catch (e) {
        console.error("Failed to delete previous article image from Cloudinary", e);
      }
    }

    article.imageUrl = imageUrl || null;
    article.imagePublicId = imagePublicId || null;
  }

  await article.save();
  return article;
};

export const deleteArticle = async ({ id, user }) => {
  const cleanId = String(id).replace(/[<>]/g, "");

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    const err = new Error("Invalid article id");
    err.status = 400;
    throw err;
  }

  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const article = await Article.findById(cleanId);
  if (!article) {
    const err = new Error("Article not found");
    err.status = 404;
    throw err;
  }

  const userId = String(user._id);
  const isAdmin = user.role === "admin";
  const isLawyer = user.role === "lawyer";

  if (article.status === "pending") {
    if (isAdmin) {
      // allowed
    } else if (isLawyer && String(article.author) === userId) {
      // allowed
    } else {
      const err = new Error("Only admins or the article's lawyer author can delete pending articles");
      err.status = 403;
      throw err;
    }
  } else if (article.status === "published") {
    if (!isAdmin) {
      const err = new Error("Only admins can delete published articles");
      err.status = 403;
      throw err;
    }

    if (article.publishedBy && String(article.publishedBy) === userId) {
      const err = new Error("The admin who published this article cannot delete it");
      err.status = 403;
      throw err;
    }
  } else {
    if (!isAdmin) {
      const err = new Error("Only admins can delete articles with this status");
      err.status = 403;
      throw err;
    }
  }

  if (article.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(article.imagePublicId);
    } catch (e) {
      // log and continue; failure to delete image should not block article deletion
      console.error("Failed to delete article image from Cloudinary", e);
    }
  }

  await article.deleteOne();
  return { success: true, message: "Article deleted successfully" };
};

export default {
  createArticle,
  getAllArticles,
  updateArticleStatus,
  updateArticle,
  deleteArticle,
};
