const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ALLOWED_ROOT_FIELDS = [
  "basicInfo",
  "experience",
  "educationQualifications",
  "barRegistrationNumber",
  "memberships",
  "expertise",
  "isFree",
  "profilePhoto",
  "professionalTitle",
  "contactInfo",
  "bio",
  "languages",
  "practiceAreas",
  "phone",
  "officeAddress",
  "location",
  "yearsOfExperience",
];

const ALLOWED_BASIC_FIELDS = [
  "profilePhoto",
  "professionalTitle",
  "contactInfo",
  "bio",
  "languages",
  "practiceAreas",
  "isFree",
];

const ALLOWED_EXPERIENCE_FIELDS = ["totalYearsExperience", "workHistory"];

const ALLOWED_EDUCATION_FIELDS = [
  "education",
  "certifications",
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

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
  Object.keys(obj).every((key) => allowedFields.includes(key));

const ALLOWED_VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

// Validate payload structure and allowed fields for lawyer profile update. 
export const validateUpdateLawyerProfile = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body cannot be empty",
    });
  }

  if (!hasOnlyAllowedKeys(body, ALLOWED_ROOT_FIELDS)) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (hasOwn(body, "basicInfo")) {
    if (!isObject(body.basicInfo)) {
      return res.status(400).json({
        success: false,
        message: "basicInfo must be an object",
      });
    }

    if (!hasOnlyAllowedKeys(body.basicInfo, ALLOWED_BASIC_FIELDS)) {
      return res.status(400).json({
        success: false,
        message: "basicInfo contains invalid fields",
      });
    }
  }

  if (hasOwn(body, "experience")) {
    if (!isObject(body.experience)) {
      return res.status(400).json({
        success: false,
        message: "experience must be an object",
      });
    }

    if (!hasOnlyAllowedKeys(body.experience, ALLOWED_EXPERIENCE_FIELDS)) {
      return res.status(400).json({
        success: false,
        message: "experience contains invalid fields",
      });
    }
  }

  if (hasOwn(body, "educationQualifications")) {
    if (!isObject(body.educationQualifications)) {
      return res.status(400).json({
        success: false,
        message: "educationQualifications must be an object",
      });
    }

    if (
      !hasOnlyAllowedKeys(
        body.educationQualifications,
        ALLOWED_EDUCATION_FIELDS,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "educationQualifications contains invalid fields",
      });
    }
  }

  if (hasOwn(body, "memberships") && !Array.isArray(body.memberships)) {
    return res.status(400).json({
      success: false,
      message: "memberships must be an array",
    });
  }

  if (
    hasOwn(body, "barRegistrationNumber") &&
    body.barRegistrationNumber !== null &&
    typeof body.barRegistrationNumber !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "barRegistrationNumber must be a string or null",
    });
  }

  if (
    hasOwn(body, "expertise") &&
    (typeof body.expertise !== "string" ||
      !ALLOWED_EXPERTISE_VALUES.includes(body.expertise))
  ) {
    return res.status(400).json({
      success: false,
      message: `expertise must be one of: ${ALLOWED_EXPERTISE_VALUES.join(", ")}.`,
    });
  }

  return next();
};

// Validate payload for admin verification status updates.
export const validateLawyerVerificationStatusUpdate = (req, res, next) => {
  const { body } = req;

  if (!isObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a JSON object",
    });
  }

  if (!hasOnlyAllowedKeys(body, ["verificationStatus"])) {
    return res.status(400).json({
      success: false,
      message: "Request contains invalid fields",
    });
  }

  if (
    !hasOwn(body, "verificationStatus") ||
    typeof body.verificationStatus !== "string" ||
    !ALLOWED_VERIFICATION_STATUSES.includes(body.verificationStatus)
  ) {
    return res.status(400).json({
      success: false,
      message: `verificationStatus must be one of: ${ALLOWED_VERIFICATION_STATUSES.join(", ")}.`,
    });
  }

  return next();
};
