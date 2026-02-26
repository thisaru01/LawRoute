import {
  followLawyerByUser,
  unfollowLawyerByUser,
} from "../../services/social/followService.js";

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
