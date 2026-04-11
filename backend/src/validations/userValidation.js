import { CIVIL_ISSUE_CATEGORIES } from "../constants/civilIssueConstants.js";

const ALLOWED_ROLES = ["user", "admin", "lawyer", "authority"];

export const validateUserRegister = (req, res, next) => {
  const { name, email, password, role, managedCategory } = req.body || {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Name is required and must be a non-empty string.",
    });
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Email is required and must be a non-empty string.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email must be a valid email address.",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required and must be a string.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasLetter || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least one letter, one number, and one special character.",
    });
  }

  if (role !== undefined) {
    if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}.`,
      });
    }
  }

  if (role === "authority") {
    if (!managedCategory || typeof managedCategory !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "ManagedCategory is required and must be a string for authority role.",
      });
    }

    if (!CIVIL_ISSUE_CATEGORIES.includes(managedCategory)) {
      return res.status(400).json({
        success: false,
        message: `ManagedCategory must be one of: ${CIVIL_ISSUE_CATEGORIES.join(", ")}.`,
      });
    }
  }

  return next();
};
