import User from "../models/userModel.js";
import LawyerProfile from "../models/lawyerProfiles/lawyerProfileModel.js";
import AuthorityProfile from "../models/authorityProfileModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, expertise, isFree, managedCategory } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (role === "authority") {
      const existingAuthority = await AuthorityProfile.findOne({
        managedCategory,
      });
      if (existingAuthority) {
        return res.status(409).json({
          success: false,
          message: "Authority already assigned to this category.",
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user.role === "lawyer") {
      await LawyerProfile.create({
        user: user._id,
        verificationStatus: "pending",
        ...(expertise && { expertise }),
        ...(typeof isFree === "boolean" && { isFree }),
      });
    }

    if (user.role === "authority") {
      try {
        await AuthorityProfile.create({
          user: user._id,
          managedCategory,
        });
      } catch (error) {
        await User.findByIdAndDelete(user._id);
        if (error.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "Authority already assigned to this category.",
          });
        }
        throw error;
      }
    }

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
export const login = async (req, res, next) => {
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

// Forgot password: generate reset token and send email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link was sent",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Use shared email service and templates (non-blocking)
    (async () => {
      try {
        const [{ passwordResetTemplate }, { sendEmail }] = await Promise.all([
          import("../services/email/passwordEmailTemplates.js"),
          import("../services/email/emailService.js"),
        ]);

        const { subject, html } = passwordResetTemplate({
          name: user?.name || "",
          resetUrl,
        });

        await sendEmail({ to: email, subject, html });
      } catch (err) {
        // Log and continue — keep API response same as when email succeeds
        // eslint-disable-next-line no-console
        console.error(
          "[Email] Failed to send password reset email:",
          err?.message || err,
        );
      }
    })();

    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link was sent",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password using token
export const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, email and new password are required",
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password has been reset" });
  } catch (error) {
    next(error);
  }
};
