import {
  likePostByUser,
  unlikePostByUser,
} from "../../services/social/postLikeService.js";

// Handle like action for an authenticated user on a post. 
export const likePost = async (req, res, next) => {
  try {
    const result = await likePostByUser(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post liked successfully",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle unlike action for an authenticated user on a post. 
export const unlikePost = async (req, res, next) => {
  try {
    const result = await unlikePostByUser(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};
