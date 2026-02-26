import mongoose from "mongoose";

import User from "../../models/userModel.js";
import Follow from "../../models/social/followModel.js";

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

const ensureValidLawyerId = (lawyerId) => {
  if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
    throw buildError("Invalid lawyer id", 400);
  }
};

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

const countFollowersByLawyerId = async (lawyerId) => {
  return Follow.countDocuments({ followee: lawyerId });
};

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
