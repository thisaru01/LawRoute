import User from "../../models/userModel.js";
import LawyerProfile from "../../models/lawyerProfileModel.js";
import Post from "../../models/social/postModel.js";
import { cloudinary } from "../../config/cloudinary.js";
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

const mapUploadedFilesToMedia = (uploadedFiles) => {
  if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
    return [];
  }

  return uploadedFiles
    .filter((file) => file && file.path)
    .map((file) => ({
      url: file.path,
      publicId: file.filename,
      resourceType: file.resource_type || "auto",
      format: file.format,
      originalFilename: file.originalname,
      bytes: file.size || 0,
    }));
};

const destroyMediaByPublicIds = async (publicIds) => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return;
  }

  const uniqueIds = [...new Set(publicIds.filter(Boolean))];

  await Promise.all(
    uniqueIds.map(async (publicId) => {
      const resourceTypes = ["image", "video", "raw"];

      for (const resourceType of resourceTypes) {
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
          });

          if (result && result.result && result.result !== "not found") {
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }),
  );
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

export const createPostByLawyer = async (authUser, payload, uploadedFiles = []) => {
  const user = await ensureLawyerUser(authUser);
  await ensureLawyerProfileExists(user._id);

  const media = mapUploadedFilesToMedia(uploadedFiles);
  const content =
    typeof payload.content === "string" ? payload.content.trim() : "";

  const post = await Post.create({
    author: user._id,
    postType: payload.postType,
    content,
    visibility: payload.visibility || "public",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    media,
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

export const updatePostByLawyer = async (
  authUser,
  postId,
  payload,
  uploadedFiles = [],
) => {
  const user = await ensureLawyerUser(authUser);
  const post = await findOwnedPost(postId, user._id);
  const media = mapUploadedFilesToMedia(uploadedFiles);
  const hasReplaceMedia = payload.replaceMedia === true;
  const removeMediaPublicIds = Array.isArray(payload.removeMediaPublicIds)
    ? payload.removeMediaPublicIds
    : [];
  const existingMedia = Array.isArray(post.media) ? [...post.media] : [];
  let nextMedia = existingMedia;

  if (Object.prototype.hasOwnProperty.call(payload, "postType")) {
    post.postType = payload.postType;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "content")) {
    post.content = payload.content.trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "visibility")) {
    post.visibility = payload.visibility;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    post.tags = Array.isArray(payload.tags) ? payload.tags : [];
  }

  if (hasReplaceMedia) {
    const allExistingPublicIds = existingMedia
      .map((item) => item && item.publicId)
      .filter(Boolean);

    await destroyMediaByPublicIds(allExistingPublicIds);
    nextMedia = [];
  } else if (removeMediaPublicIds.length > 0) {
    const removeSet = new Set(removeMediaPublicIds);
    const toRemove = existingMedia
      .filter((item) => item && item.publicId && removeSet.has(item.publicId))
      .map((item) => item.publicId)
      .filter(Boolean);

    await destroyMediaByPublicIds(toRemove);

    nextMedia = existingMedia.filter(
      (item) => !(item && item.publicId && removeSet.has(item.publicId)),
    );
  }

  if (media.length > 0) {
    nextMedia = [...nextMedia, ...media];
  }

  post.media = nextMedia;

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate("author", "name email role profilePhoto")
    .lean();

  return updatedPost;
};

export const deletePostByLawyer = async (authUser, postId) => {
  const user = await ensureLawyerUser(authUser);
  const post = await findOwnedPost(postId, user._id);

  const existingMediaPublicIds = (post.media || [])
    .map((item) => item && item.publicId)
    .filter(Boolean);

  await destroyMediaByPublicIds(existingMediaPublicIds);

  await post.deleteOne();
};
