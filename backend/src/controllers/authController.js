import User from "../models/userModel.js";
import LawyerProfile from "../models/lawyerProfiles/lawyerProfileModel.js";
import AuthorityProfile from "../models/authorityProfileModel.js";
import jwt from "jsonwebtoken";

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
      const existingAuthority = await AuthorityProfile.findOne({ managedCategory });
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
