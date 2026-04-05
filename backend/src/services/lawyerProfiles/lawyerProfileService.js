import User from "../../models/userModel.js";
import LawyerProfile from "../../models/lawyerProfiles/lawyerProfileModel.js";
import mongoose from "mongoose";

const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

const ALLOWED_BASIC_FIELDS = [
  "professionalTitle",
  "contactInfo",
  "bio",
  "languages",
  "practiceAreas",
];

const ALLOWED_EXPERTISE_VALUES = [
  "general",
  "civil",
  "criminal",
  "commercial",
  "corporate",
  "family",
  "land",
  "labour",
  "tax",
  "constitutional",
  "administrative",
  "environmental",
  "intellectual_property",
];

const ALLOWED_EXPERIENCE_FIELDS = ["totalYearsExperience", "workHistory"];

const ALLOWED_EDUCATION_FIELDS = [
  "education",
  "certifications",
];

const LEGACY_BASIC_FIELD_MAP = {
  professionalTitle: "professionalTitle",
  languages: "languages",
  bio: "bio",
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Ensure editable nested profile sections
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

// Copy allowed fields from a source section into a target object. 
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

// Apply modern structured payload fields into the lawyer profile model.
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

  if (hasOwn(body, "barRegistrationNumber")) {
    lawyerProfile.barRegistrationNumber = body.barRegistrationNumber;
    applied = true;
  }

  if (hasOwn(body, "expertise")) {
    lawyerProfile.expertise = body.expertise;
    applied = true;
  }

  if (hasOwn(body, "memberships")) {
    lawyerProfile.memberships = Array.isArray(body.memberships)
      ? body.memberships
      : [];
    applied = true;
  }

  // Backward compatibility for clients still sending this under educationQualifications.
  if (
    educationQualifications &&
    typeof educationQualifications === "object" &&
    hasOwn(educationQualifications, "barRegistrationNumber")
  ) {
    lawyerProfile.barRegistrationNumber =
      educationQualifications.barRegistrationNumber;
    applied = true;
  }

  // Backward compatibility for old payloads that nested memberships under educationQualifications.
  if (
    educationQualifications &&
    typeof educationQualifications === "object" &&
    hasOwn(educationQualifications, "memberships")
  ) {
    lawyerProfile.memberships = Array.isArray(educationQualifications.memberships)
      ? educationQualifications.memberships
      : [];
    applied = true;
  }

  return applied;
};

// Apply legacy phone/location fields into basicInfo.contactInfo. 
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

// Apply backward-compatible legacy payload fields. 
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

// Compute whether minimum profile details are complete. 
const computeProfileCompleted = (lawyerProfile) => {
  const basic = lawyerProfile.basicInfo || {};
  const education = lawyerProfile.educationQualifications || {};
  const hasPracticeAreas =
    Array.isArray(basic.practiceAreas) && basic.practiceAreas.length > 0;
  const hasContactInfo =
    basic.contactInfo &&
    typeof basic.contactInfo === "object" &&
    !Array.isArray(basic.contactInfo) &&
    Object.keys(basic.contactInfo).length > 0;
  const hasEducation =
    Array.isArray(education.education) && education.education.length > 0;
  const hasMemberships =
    Array.isArray(lawyerProfile.memberships) && lawyerProfile.memberships.length > 0;
  const hasValidExpertise =
    typeof lawyerProfile.expertise === "string" &&
    ALLOWED_EXPERTISE_VALUES.includes(lawyerProfile.expertise) &&
    lawyerProfile.expertise !== "general";

  return Boolean(
    basic.professionalTitle &&
    basic.bio &&
    hasContactInfo &&
    hasPracticeAreas &&
    hasValidExpertise &&
    hasEducation &&
    hasMemberships &&
    lawyerProfile.barRegistrationNumber,
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
        profilePhoto: lawyerProfile.user.profilePhoto,
      }
    : null,
  expertise: lawyerProfile.expertise,
  verificationStatus: lawyerProfile.verificationStatus || "pending",
  barRegistrationNumber: lawyerProfile.barRegistrationNumber || null,
  memberships: lawyerProfile.memberships || [],
  isFree: lawyerProfile.isFree,
  basicInfo: lawyerProfile.basicInfo || {},
  experience: lawyerProfile.experience || {},
  educationQualifications: lawyerProfile.educationQualifications || {},
  profileCompleted: lawyerProfile.profileCompleted,
  createdAt: lawyerProfile.createdAt,
  updatedAt: lawyerProfile.updatedAt,
});

const ensureValidUserId = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user id");
    error.statusCode = 400;
    throw error;
  }
};

const ensureLawyerUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "lawyer") {
    const error = new Error("Selected user is not a lawyer");
    error.statusCode = 400;
    throw error;
  }

  return user;
};

const findOrCreateLawyerProfileByUserId = async (userId) => {
  let lawyerProfile = await LawyerProfile.findOne({ user: userId });

  if (!lawyerProfile) {
    lawyerProfile = await LawyerProfile.create({
      user: userId,
      verificationStatus: "pending",
    });
  }

  return lawyerProfile;
};

// Return all lawyer profiles for public listing.
export const findAllLawyerProfiles = async () => {
  const lawyerProfiles = await LawyerProfile.find({})
    .populate("user", "name email role profilePhoto")
    .sort({ createdAt: -1 })
    .lean();

  return lawyerProfiles.map(mapLawyerProfileResponse);
};

// Return only approved lawyer profiles for public listing.
// Accepts optional { search, expertise, isFree } for filtering.
export const findApprovedLawyerProfiles = async ({ search, expertise, isFree } = {}) => {
  const filter = { verificationStatus: "approved" };

  if (expertise && ALLOWED_EXPERTISE_VALUES.includes(expertise)) {
    filter.expertise = expertise;
  }

  if (isFree === true || isFree === "true") {
    filter.isFree = true;
  }

  const lawyerProfiles = await LawyerProfile.find(filter)
    .populate({
      path: "user",
      select: "name email role profilePhoto",
      match: { role: "lawyer" },
    })
    .sort({ createdAt: -1 })
    .lean();

  let results = lawyerProfiles
    .filter((lawyerProfile) => Boolean(lawyerProfile.user))
    .map(mapLawyerProfileResponse);

  // Post-populate text search on name, title, and bio
  if (search && typeof search === "string" && search.trim()) {
    const query = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(query) ||
        p.basicInfo?.professionalTitle?.toLowerCase().includes(query) ||
        p.basicInfo?.bio?.toLowerCase().includes(query),
    );
  }

  return results;
};

// Return lawyer profiles for admin review, optionally filtered by verification status.
export const findLawyerProfilesForAdmin = async ({ verificationStatus } = {}) => {
  if (
    verificationStatus !== undefined &&
    !VERIFICATION_STATUSES.includes(verificationStatus)
  ) {
    const error = new Error("Invalid verificationStatus filter");
    error.statusCode = 400;
    throw error;
  }

  const filter = {};

  if (verificationStatus) {
    filter.verificationStatus = verificationStatus;
  }

  const lawyerProfiles = await LawyerProfile.find(filter)
    .populate({
      path: "user",
      select: "name email role profilePhoto",
      match: { role: "lawyer" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return lawyerProfiles
    .filter((lawyerProfile) => Boolean(lawyerProfile.user))
    .map(mapLawyerProfileResponse);
};

// Update verification status for a lawyer profile after validating the target user is a lawyer.
export const updateLawyerVerificationStatusByAdmin = async ({
  userId,
  verificationStatus,
}) => {
  ensureValidUserId(userId);

  if (!VERIFICATION_STATUSES.includes(verificationStatus)) {
    const error = new Error("Invalid verificationStatus value");
    error.statusCode = 400;
    throw error;
  }

  await ensureLawyerUserById(userId);

  const lawyerProfile = await findOrCreateLawyerProfileByUserId(userId);

  if (verificationStatus === "approved") {
    if (!lawyerProfile.profileCompleted) {
      const error = new Error(
        "Cannot approve lawyer before completing profile",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!lawyerProfile.barRegistrationNumber) {
      const error = new Error(
        "Cannot approve lawyer without bar registration number",
      );
      error.statusCode = 400;
      throw error;
    }
  }

  lawyerProfile.verificationStatus = verificationStatus;
  await lawyerProfile.save();

  const populatedLawyerProfile = await LawyerProfile.findById(lawyerProfile._id)
    .populate("user", "name email role profilePhoto")
    .lean();

  return mapLawyerProfileResponse(populatedLawyerProfile);
};

// Return or auto-create the authenticated lawyer profile.
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
    .populate("user", "name email role profilePhoto")
    .lean();

  if (!lawyerProfile) {
    const createdProfile = await LawyerProfile.create({
      user: user._id,
      verificationStatus: "pending",
    });
    lawyerProfile = await LawyerProfile.findById(createdProfile._id)
      .populate("user", "name email role profilePhoto")
      .lean();
  }

  return mapLawyerProfileResponse(lawyerProfile);
};

// Update authenticated lawyer profile with structured or legacy payload.
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
    lawyerProfile = await LawyerProfile.create({
      user: user._id,
      verificationStatus: "pending",
    });
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
