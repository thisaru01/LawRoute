import AuthorityProfile from "../../models/authorityProfileModel.js";
import User from "../../models/userModel.js";

/**
 * Admin: Get all authority profiles with associated user data.
 */
export const getAuthorityProfiles = async (req, res, next) => {
  try {
    const profiles = await AuthorityProfile.find()
      .populate("user", "name email role profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update an authority's password.
 */
export const updateAuthorityPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const profile = await AuthorityProfile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Authority profile not found.",
      });
    }

    const user = await User.findById(profile.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user not found.",
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete an authority profile and its associated user account.
 */
export const deleteAuthority = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await AuthorityProfile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Authority profile not found.",
      });
    }

    // Delete associated user
    await User.findByIdAndDelete(profile.user);
    
    // Delete profile
    await AuthorityProfile.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Authority and associated account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
