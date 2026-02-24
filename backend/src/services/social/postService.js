import User from "../../models/userModel.js";
import LawyerProfile from "../../models/lawyerProfileModel.js";
import Post from "../../models/social/postModel.js";
import mongoose from "mongoose";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureLawyerUser = async (authUser) => {
  if (!authUser || !authUser._id) {
    throw buildError("Unauthorized", 401);
  }

  const user = await User.findById(authUser._id);

  if (!user) {
    throw buildError("User not found", 404);
  }

  if (user.role !== "lawyer") {
    throw buildError("Only lawyers can create posts", 403);
  }

  return user;
};

const ensureLawyerProfileExists = async (userId) => {
  const profile = await LawyerProfile.findOne({ user: userId });

  if (!profile) {
    await LawyerProfile.create({ user: userId });
  }
};

const parseCursorDate = (cursor) => {
  if (!cursor) {
    return null;
  }

  const parsedDate = new Date(cursor);

  if (Number.isNaN(parsedDate.getTime())) {
    throw buildError("Invalid cursor", 400);
  }

  return parsedDate;
};

const parseLimit = (limit) => {
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return 20;
  }

  return Math.min(parsedLimit, 50);
};

const buildPaginationQuery = (baseQuery, cursor) => {
  const query = { ...baseQuery };
  const cursorDate = parseCursorDate(cursor);

  if (cursorDate) {
    query.createdAt = { $lt: cursorDate };
  }

  return query;
};

export const createPostByLawyer = async (authUser, payload) => {
  const user = await ensureLawyerUser(authUser);
  await ensureLawyerProfileExists(user._id);

  const post = await Post.create({
    author: user._id,
    postType: payload.postType,
    content: payload.content,
    visibility: payload.visibility || "public",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
  });

  const createdPost = await Post.findById(post._id)
    .populate("author", "name email role profilePhoto")
    .lean();

  return createdPost;
};

export const findPublicPosts = async ({ limit = 20, cursor } = {}) => {
  const query = buildPaginationQuery({ visibility: "public" }, cursor);
  const safeLimit = parseLimit(limit);

  const posts = await Post.find(query)
    .populate("author", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return posts;
};

export const findFeedPosts = async ({ limit = 20, cursor } = {}) => {
  return findPublicPosts({ limit, cursor });
};

export const findMyPosts = async (authUser, { limit = 20, cursor } = {}) => {
  const user = await ensureLawyerUser(authUser);

  const query = buildPaginationQuery({ author: user._id }, cursor);
  const safeLimit = parseLimit(limit);

  const posts = await Post.find(query)
    .populate("author", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return posts;
};

const ensureValidLawyerId = (lawyerId) => {
  if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
    throw buildError("Invalid lawyer id", 400);
  }
};

export const findPostsByLawyer = async (
  lawyerId,
  { limit = 20, cursor } = {},
) => {
  ensureValidLawyerId(lawyerId);

  const lawyerUser = await User.findById(lawyerId);

  if (!lawyerUser) {
    throw buildError("Lawyer not found", 404);
  }

  if (lawyerUser.role !== "lawyer") {
    throw buildError("Target user is not a lawyer", 400);
  }

  const query = buildPaginationQuery(
    {
      author: lawyerUser._id,
      visibility: "public",
    },
    cursor,
  );
  const safeLimit = parseLimit(limit);

  const posts = await Post.find(query)
    .populate("author", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return posts;
};

const ensureValidPostId = (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw buildError("Invalid post id", 400);
  }
};

const findOwnedPost = async (postId, userId) => {
  ensureValidPostId(postId);

  const post = await Post.findById(postId);

  if (!post) {
    throw buildError("Post not found", 404);
  }

  if (post.author.toString() !== userId.toString()) {
    throw buildError("Access denied. You can only manage your own posts", 403);
  }

  return post;
};

export const updatePostByLawyer = async (authUser, postId, payload) => {
  const user = await ensureLawyerUser(authUser);
  const post = await findOwnedPost(postId, user._id);

  if (Object.prototype.hasOwnProperty.call(payload, "postType")) {
    post.postType = payload.postType;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "content")) {
    post.content = payload.content;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "visibility")) {
    post.visibility = payload.visibility;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    post.tags = Array.isArray(payload.tags) ? payload.tags : [];
  }

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate("author", "name email role profilePhoto")
    .lean();

  return updatedPost;
};

export const deletePostByLawyer = async (authUser, postId) => {
  const user = await ensureLawyerUser(authUser);
  const post = await findOwnedPost(postId, user._id);

  await post.deleteOne();
};
