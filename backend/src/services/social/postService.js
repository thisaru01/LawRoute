import User from "../../models/userModel.js";
import LawyerProfile from "../../models/lawyerProfileModel.js";
import Post from "../../models/social/postModel.js";

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
  const query = { visibility: "public" };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await Post.find(query)
    .populate("author", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return posts;
};
