import {
  followLawyerByUser,
  unfollowLawyerByUser,
} from "../../services/social/followService.js";

// Follow a lawyer for the authenticated user.
export const followLawyer = async (req, res, next) => {
  try {
    const result = await followLawyerByUser(req.user, req.params.lawyerId);

    return res.status(200).json({
      success: true,
      message: result.changed
        ? "Lawyer followed successfully"
        : "Already following this lawyer",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

// Unfollow a lawyer for the authenticated user. 
export const unfollowLawyer = async (req, res, next) => {
  try {
    const result = await unfollowLawyerByUser(req.user, req.params.lawyerId);

    return res.status(200).json({
      success: true,
      message: result.changed
        ? "Lawyer unfollowed successfully"
        : "You are not following this lawyer",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};
