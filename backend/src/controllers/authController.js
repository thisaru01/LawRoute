const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update lawyer profile details after login
exports.updateLawyerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "lawyer") {
      return res.status(403).json({
        success: false,
        message: "Only lawyers can update lawyer profile",
      });
    }

    const allowedBasicFields = [
      "profilePhoto",
      "professionalTitle",
      "phone",
      "officeAddress",
      "location",
      "languages",
      "isFree",
      "bio",
      "practiceAreas",
    ];
    const allowedExperienceFields = ["totalYearsExperience", "workHistory"];
    const allowedEducationFields = [
      "education",
      "certifications",
      "barRegistrationNumber",
      "memberships",
    ];

    let hasValidField = false;

    if (!user.lawyerProfile) {
      user.lawyerProfile = {};
    }

    if (!user.lawyerProfile.basicInfo) {
      user.lawyerProfile.basicInfo = {};
    }

    if (!user.lawyerProfile.experience) {
      user.lawyerProfile.experience = {};
    }

    if (!user.lawyerProfile.educationQualifications) {
      user.lawyerProfile.educationQualifications = {};
    }

    const { basicInfo, experience, educationQualifications } = req.body;

    if (basicInfo && typeof basicInfo === "object") {
      allowedBasicFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(basicInfo, field)) {
          user.lawyerProfile.basicInfo[field] = basicInfo[field];
          hasValidField = true;
        }
      });
    }

    if (experience && typeof experience === "object") {
      allowedExperienceFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(experience, field)) {
          user.lawyerProfile.experience[field] = experience[field];
          hasValidField = true;
        }
      });
    }

    if (educationQualifications && typeof educationQualifications === "object") {
      allowedEducationFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(educationQualifications, field)) {
          user.lawyerProfile.educationQualifications[field] =
            educationQualifications[field];
          hasValidField = true;
        }
      });
    }

    // Temporary backward compatibility for old flat payloads
    if (!hasValidField) {
      const legacyMap = {
        professionalTitle: "professionalTitle",
        phone: "phone",
        officeAddress: "officeAddress",
        profilePhoto: "profilePhoto",
        languages: "languages",
        isFree: "isFree",
        bio: "bio",
      };

      Object.keys(legacyMap).forEach((legacyField) => {
        if (Object.prototype.hasOwnProperty.call(req.body, legacyField)) {
          user.lawyerProfile.basicInfo[legacyMap[legacyField]] = req.body[legacyField];
          hasValidField = true;
        }
      });

      if (Object.prototype.hasOwnProperty.call(req.body, "practiceAreas")) {
        const areas = req.body.practiceAreas;
        user.lawyerProfile.basicInfo.practiceAreas = Array.isArray(areas)
          ? areas.map((item) =>
              typeof item === "string"
                ? { name: item, level: "intermediate" }
                : item,
            )
          : [];
        hasValidField = true;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, "yearsOfExperience")) {
        user.lawyerProfile.experience.totalYearsExperience =
          req.body.yearsOfExperience;
        hasValidField = true;
      }
    }

    if (!hasValidField) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const basic = user.lawyerProfile.basicInfo || {};
    const exp = user.lawyerProfile.experience || {};
    const hasPracticeAreas =
      Array.isArray(basic.practiceAreas) && basic.practiceAreas.length > 0;

    user.profileCompleted = Boolean(
      basic.professionalTitle &&
        typeof exp.totalYearsExperience === "number" &&
        exp.totalYearsExperience >= 0 &&
        basic.bio &&
        basic.phone &&
        hasPracticeAreas,
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
