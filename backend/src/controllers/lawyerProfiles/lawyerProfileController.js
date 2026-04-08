import {
  findApprovedLawyerProfiles,
  findAllLawyerProfiles,
  findLawyerProfileByUser,
  findLawyerProfileById,
  findLawyerProfilesForAdmin,
  updateLawyerVerificationStatusByAdmin,
  updateLawyerProfileByUser,
} from "../../services/lawyerProfiles/lawyerProfileService.js";

// Get all lawyer profiles for public browsing.
export const getAllLawyerProfiles = async (req, res, next) => {
  try {
    const lawyerProfiles = await findAllLawyerProfiles();

    return res.status(200).json({
      success: true,
      count: lawyerProfiles.length,
      lawyerProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// Get approved lawyer profiles for public browsing.
// Supports optional query params: search, expertise, isFree
export const getApprovedLawyerProfiles = async (req, res, next) => {
  try {
    const { search, expertise, isFree } = req.query;
    const lawyerProfiles = await findApprovedLawyerProfiles({
      search,
      expertise,
      isFree,
    });

    return res.status(200).json({
      success: true,
      count: lawyerProfiles.length,
      lawyerProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// Update the authenticated lawyer profile details.
export const updateLawyerProfile = async (req, res, next) => {
  try {
    const lawyerProfile = await updateLawyerProfileByUser(req.user, req.body);

    return res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      lawyerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Get the authenticated lawyer's own profile.
export const getMyLawyerProfile = async (req, res, next) => {
  try {
    const lawyerProfile = await findLawyerProfileByUser(req.user);

    return res.status(200).json({
      success: true,
      lawyerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Get lawyer profiles for admin moderation with optional verification status filter.
export const getLawyerProfilesForAdmin = async (req, res, next) => {
  try {
    const lawyerProfiles = await findLawyerProfilesForAdmin({
      verificationStatus: req.query.verificationStatus,
    });

    return res.status(200).json({
      success: true,
      count: lawyerProfiles.length,
      lawyerProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// Update a lawyer's verification status as admin.
export const updateLawyerVerificationStatus = async (req, res, next) => {
  try {
    const lawyerProfile = await updateLawyerVerificationStatusByAdmin({
      userId: req.params.userId,
      verificationStatus: req.body.verificationStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer verification status updated successfully",
      lawyerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single lawyer profile by ID.
export const getLawyerProfileById = async (req, res, next) => {
  try {
    const lawyerProfile = await findLawyerProfileById(req.params.id);

    return res.status(200).json({
      success: true,
      lawyerProfile,
    });
  } catch (error) {
    next(error);
  }
};
