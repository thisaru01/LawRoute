import mongoose from "mongoose";

import Post from "../../models/social/postModel.js";
import PostLike from "../../models/social/postLikeModel.js";

// Create a standardized error object with an HTTP status code. 
const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Ensure request includes an authenticated user. 
const ensureAuthenticatedUser = (authUser) => {
  if (!authUser || !authUser._id) {
    throw buildError("Unauthorized", 401);
  }

  return authUser;
};

// Validate that postId is a valid Mongo ObjectId. 
const ensureValidPostId = (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw buildError("Invalid post id", 400);
  }
};

// Ensure the target post exists before mutating likes. 
const findPostOrThrow = async (postId) => {
  const post = await Post.findById(postId).select("stats.likeCount");

  if (!post) {
    throw buildError("Post not found", 404);
  }

  return post;
};

// Like a post idempotently and keep likeCount in sync. 
export const likePostByUser = async (authUser, postId) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidPostId(postId);
  await findPostOrThrow(postId);

  let inserted = false;

  try {
    const result = await PostLike.updateOne(
      { post: postId, user: user._id },
      { $setOnInsert: { post: postId, user: user._id } },
      { upsert: true },
    );

    inserted = result.upsertedCount > 0;
  } catch (error) {
    if (error && error.code !== 11000) {
      throw error;
    }
  }

  if (inserted) {
    await Post.updateOne({ _id: postId }, { $inc: { "stats.likeCount": 1 } });
  }

  const updatedPost = await Post.findById(postId).select("stats.likeCount").lean();

  return {
    postId,
    liked: true,
    likeCount: updatedPost?.stats?.likeCount || 0,
  };
};

// Unlike a post idempotently and keep likeCount in sync. 
export const unlikePostByUser = async (authUser, postId) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidPostId(postId);
  await findPostOrThrow(postId);

  const deleteResult = await PostLike.deleteOne({
    post: postId,
    user: user._id,
  });

  if (deleteResult.deletedCount > 0) {
    await Post.updateOne(
      { _id: postId, "stats.likeCount": { $gt: 0 } },
      { $inc: { "stats.likeCount": -1 } },
    );
  }

  const updatedPost = await Post.findById(postId).select("stats.likeCount").lean();

  return {
    postId,
    liked: false,
    likeCount: updatedPost?.stats?.likeCount || 0,
  };
};
