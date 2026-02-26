import mongoose from "mongoose";

import Post from "../../models/social/postModel.js";
import Comment from "../../models/social/commentModel.js";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureAuthenticatedUser = (authUser) => {
  if (!authUser || !authUser._id) {
    throw buildError("Unauthorized", 401);
  }

  return authUser;
};

const ensureValidObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError(`Invalid ${fieldName} id`, 400);
  }
};

const ensurePostExists = async (postId) => {
  const post = await Post.findById(postId).select("_id");

  if (!post) {
    throw buildError("Post not found", 404);
  }
};

export const createCommentByUser = async (authUser, postId, payload) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidObjectId(postId, "post");
  await ensurePostExists(postId);

  const commentData = {
    post: postId,
    author: user._id,
    content: payload.content,
  };

  if (payload.parentComment) {
    ensureValidObjectId(payload.parentComment, "parentComment");

    const parentComment = await Comment.findById(payload.parentComment).select(
      "post",
    );

    if (!parentComment || parentComment.post.toString() !== postId.toString()) {
      throw buildError("Parent comment not found for this post", 404);
    }

    commentData.parentComment = payload.parentComment;
  }

  const comment = await Comment.create(commentData);

  await Post.updateOne(
    { _id: postId },
    { $inc: { "stats.commentCount": 1 } },
  );

  const createdComment = await Comment.findById(comment._id)
    .populate("author", "name email role profilePhoto")
    .lean();

  return createdComment;
};

export const findCommentsByPost = async (postId, { limit = 20, cursor } = {}) => {
  ensureValidObjectId(postId, "post");
  await ensurePostExists(postId);

  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0
    ? Math.min(Number(limit), 50)
    : 20;

  const query = { post: postId };

  if (cursor) {
    const cursorDate = new Date(cursor);

    if (Number.isNaN(cursorDate.getTime())) {
      throw buildError("Invalid cursor", 400);
    }

    query.createdAt = { $lt: cursorDate };
  }

  const comments = await Comment.find(query)
    .populate("author", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return comments;
};

export const deleteCommentByUser = async (authUser, commentId) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidObjectId(commentId, "comment");

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw buildError("Comment not found", 404);
  }

  if (comment.author.toString() !== user._id.toString()) {
    throw buildError("Access denied. You can only delete your own comments", 403);
  }

  await Comment.deleteOne({ _id: comment._id });

  await Post.updateOne(
    { _id: comment.post, "stats.commentCount": { $gt: 0 } },
    { $inc: { "stats.commentCount": -1 } },
  );
};
