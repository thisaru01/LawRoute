import User from "../models/userModel.js";
import LawyerProfile from "../models/lawyerProfileModel.js";

const ALLOWED_BASIC_FIELDS = [
  "profilePhoto",
  "professionalTitle",
  "contactInfo",
  "bio",
  "languages",
  "practiceAreas",
];

const ALLOWED_EXPERIENCE_FIELDS = ["totalYearsExperience", "workHistory"];

const ALLOWED_EDUCATION_FIELDS = [
  "education",
  "certifications",
  "barRegistrationNumber",
  "memberships",
];

const LEGACY_BASIC_FIELD_MAP = {
  professionalTitle: "professionalTitle",
  profilePhoto: "profilePhoto",
  languages: "languages",
  bio: "bio",
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ensureProfileSections = (lawyerProfile) => {
  if (!lawyerProfile.basicInfo) {
    lawyerProfile.basicInfo = {};
  }

  if (!lawyerProfile.experience) {
    lawyerProfile.experience = {};
  }

  if (!lawyerProfile.educationQualifications) {
    lawyerProfile.educationQualifications = {};
  }
};

const applySectionFields = (source, allowedFields, target) => {
  if (!source || typeof source !== "object") {
    return false;
  }

  let applied = false;

  allowedFields.forEach((field) => {
    if (hasOwn(source, field)) {
      target[field] = source[field];
      applied = true;
    }
  });

  return applied;
};

const applyStructuredPayload = (lawyerProfile, body) => {
  const { basicInfo, experience, educationQualifications } = body;

  let applied = false;

  if (
    applySectionFields(basicInfo, ALLOWED_BASIC_FIELDS, lawyerProfile.basicInfo)
  ) {
    applied = true;
  }

  if (
    applySectionFields(
      experience,
      ALLOWED_EXPERIENCE_FIELDS,
      lawyerProfile.experience,
    )
  ) {
    applied = true;
  }

  if (
    applySectionFields(
      educationQualifications,
      ALLOWED_EDUCATION_FIELDS,
      lawyerProfile.educationQualifications,
    )
  ) {
    applied = true;
  }

  if (
    basicInfo &&
    typeof basicInfo === "object" &&
    hasOwn(basicInfo, "isFree")
  ) {
    lawyerProfile.isFree = Boolean(basicInfo.isFree);
    applied = true;
  }

  if (hasOwn(body, "isFree")) {
    lawyerProfile.isFree = Boolean(body.isFree);
    applied = true;
  }

  return applied;
};

const applyLegacyContactInfo = (lawyerProfile, body) => {
  if (
    !hasOwn(body, "phone") &&
    !hasOwn(body, "officeAddress") &&
    !hasOwn(body, "location")
  ) {
    return false;
  }

  const currentContactInfo =
    lawyerProfile.basicInfo.contactInfo &&
    typeof lawyerProfile.basicInfo.contactInfo === "object"
      ? lawyerProfile.basicInfo.contactInfo
      : {};

  lawyerProfile.basicInfo.contactInfo = {
    ...currentContactInfo,
    ...(hasOwn(body, "phone") && { phone: body.phone }),
    ...(hasOwn(body, "officeAddress") && {
      officeAddress: body.officeAddress,
    }),
    ...(hasOwn(body, "location") && { location: body.location }),
  };

  return true;
};

const applyLegacyPayload = (lawyerProfile, body) => {
  let applied = false;

  Object.keys(LEGACY_BASIC_FIELD_MAP).forEach((legacyField) => {
    if (hasOwn(body, legacyField)) {
      lawyerProfile.basicInfo[LEGACY_BASIC_FIELD_MAP[legacyField]] =
        body[legacyField];
      applied = true;
    }
  });

  if (applyLegacyContactInfo(lawyerProfile, body)) {
    applied = true;
  }

  if (hasOwn(body, "practiceAreas")) {
    const areas = body.practiceAreas;
    lawyerProfile.basicInfo.practiceAreas = Array.isArray(areas)
      ? areas.map((item) =>
          typeof item === "string"
            ? { name: item, level: "intermediate" }
            : item,
        )
      : [];
    applied = true;
  }

  if (hasOwn(body, "yearsOfExperience")) {
    lawyerProfile.experience.totalYearsExperience = body.yearsOfExperience;
    applied = true;
  }

  return applied;
};

const computeProfileCompleted = (lawyerProfile) => {
  const basic = lawyerProfile.basicInfo || {};
  const exp = lawyerProfile.experience || {};
  const hasPracticeAreas =
    Array.isArray(basic.practiceAreas) && basic.practiceAreas.length > 0;

  return Boolean(
    basic.professionalTitle &&
    typeof exp.totalYearsExperience === "number" &&
    exp.totalYearsExperience >= 0 &&
    basic.bio &&
    hasPracticeAreas,
  );
};

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

export const findAllLawyerProfiles = async () => {
  const lawyerProfiles = await LawyerProfile.find({})
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return lawyerProfiles.map(mapLawyerProfileResponse);
};

export const findLawyerProfileByUser = async (authUser) => {
  if (!authUser || !authUser._id) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(authUser._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "lawyer") {
    const error = new Error("Only lawyers can access lawyer profile");
    error.statusCode = 403;
    throw error;
  }

  let lawyerProfile = await LawyerProfile.findOne({ user: user._id })
    .populate("user", "name email role")
    .lean();

  if (!lawyerProfile) {
    const createdProfile = await LawyerProfile.create({ user: user._id });
    lawyerProfile = await LawyerProfile.findById(createdProfile._id)
      .populate("user", "name email role")
      .lean();
  }

  return mapLawyerProfileResponse(lawyerProfile);
};

export const updateLawyerProfileByUser = async (authUser, body) => {
  if (!authUser || !authUser._id) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(authUser._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "lawyer") {
    const error = new Error("Only lawyers can update lawyer profile");
    error.statusCode = 403;
    throw error;
  }

  let lawyerProfile = await LawyerProfile.findOne({ user: user._id });

  if (!lawyerProfile) {
    lawyerProfile = await LawyerProfile.create({ user: user._id });
  }

  ensureProfileSections(lawyerProfile);

  let hasValidField = applyStructuredPayload(lawyerProfile, body);

  if (!hasValidField) {
    hasValidField = applyLegacyPayload(lawyerProfile, body);
  }

  if (!hasValidField) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  lawyerProfile.profileCompleted = computeProfileCompleted(lawyerProfile);

  await lawyerProfile.save();

  return lawyerProfile;
};
