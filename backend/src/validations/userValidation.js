const ALLOWED_ROLES = ["user", "admin", "lawyer", "authority"];

export const validateUserRegister = (req, res, next) => {
  const { name, email, password, role } = req.body || {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "name is required and must be a non-empty string.",
    });
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "email is required and must be a non-empty string.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "email must be a valid email address.",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "password is required and must be a string.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "password must be at least 8 characters long.",
    });
  }

  if (role !== undefined) {
    if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${ALLOWED_ROLES.join(", ")}.`,
      });
    }
  }

  return next();
};
