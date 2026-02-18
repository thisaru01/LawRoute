const LawyerProfile = require("../models/lawyerProfileModel");

const mapLawyerProfileResponse = (lawyerProfile) => ({
  id: lawyerProfile._id,
  user: lawyerProfile.user
    ? {
        id: lawyerProfile.user._id,
        name: lawyerProfile.user.name,
        email: lawyerProfile.user.email,
        role: lawyerProfile.user.role,
      }
    : null,
  expertise: lawyerProfile.expertise,
  isVerified: lawyerProfile.isVerified,
  isFree: lawyerProfile.isFree,
  basicInfo: lawyerProfile.basicInfo || {},
  experience: lawyerProfile.experience || {},
  educationQualifications: lawyerProfile.educationQualifications || {},
  profileCompleted: lawyerProfile.profileCompleted,
  createdAt: lawyerProfile.createdAt,
  updatedAt: lawyerProfile.updatedAt,
});

const findAllLawyerProfiles = async () => {
  const lawyerProfiles = await LawyerProfile.find({})
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return lawyerProfiles.map(mapLawyerProfileResponse);
};

module.exports = {
  findAllLawyerProfiles,
};
