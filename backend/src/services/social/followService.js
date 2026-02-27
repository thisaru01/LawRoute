import mongoose from "mongoose";

import User from "../../models/userModel.js";
import Follow from "../../models/social/followModel.js";

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

// Validate that lawyerId is a valid Mongo ObjectId. 
const ensureValidLawyerId = (lawyerId) => {
  if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
    throw buildError("Invalid lawyer id", 400);
  }
};

// Load and validate that the target user exists and is a lawyer. 
const findLawyerOrThrow = async (lawyerId) => {
  const lawyer = await User.findById(lawyerId).select("_id role");

  if (!lawyer) {
    throw buildError("Lawyer not found", 404);
  }

  if (lawyer.role !== "lawyer") {
    throw buildError("Target user is not a lawyer", 400);
  }

  return lawyer;
};

// Count followers for the provided lawyer id. 
const countFollowersByLawyerId = async (lawyerId) => {
  return Follow.countDocuments({ followee: lawyerId });
};

// Follow a lawyer idempotently for the authenticated user. 
export const followLawyerByUser = async (authUser, lawyerId) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidLawyerId(lawyerId);

  if (user._id.toString() === lawyerId.toString()) {
    throw buildError("You cannot follow yourself", 400);
  }

  await findLawyerOrThrow(lawyerId);

  let followed = false;

  try {
    const result = await Follow.updateOne(
      { follower: user._id, followee: lawyerId },
      { $setOnInsert: { follower: user._id, followee: lawyerId } },
      { upsert: true },
    );

    followed = result.upsertedCount > 0;
  } catch (error) {
    if (error && error.code !== 11000) {
      throw error;
    }
  }

  const followerCount = await countFollowersByLawyerId(lawyerId);

  return {
    lawyerId,
    isFollowing: true,
    changed: followed,
    followerCount,
  };
};

// Unfollow a lawyer idempotently for the authenticated user. 
export const unfollowLawyerByUser = async (authUser, lawyerId) => {
  const user = ensureAuthenticatedUser(authUser);
  ensureValidLawyerId(lawyerId);
  await findLawyerOrThrow(lawyerId);

  const result = await Follow.deleteOne({
    follower: user._id,
    followee: lawyerId,
  });

  const followerCount = await countFollowersByLawyerId(lawyerId);

  return {
    lawyerId,
    isFollowing: false,
    changed: result.deletedCount > 0,
    followerCount,
  };
};
