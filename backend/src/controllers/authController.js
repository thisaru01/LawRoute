const User = require("../models/userModel");
const LawyerProfile = require("../models/lawyerProfileModel");
const AuthorityProfile = require("../models/authorityProfileModel");
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
    const { name, email, password, role, expertise, isFree, managedCategory } = req.body;

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

    if (user.role === "lawyer") {
      await LawyerProfile.create({
        user: user._id,
        ...(expertise && { expertise }),
        ...(typeof isFree === "boolean" && { isFree }),
      });
    }

    if (user.role === "authority") {
      await AuthorityProfile.create({
        user: user._id,
        managedCategory,
      });
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
