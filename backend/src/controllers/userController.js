import User from "../models/userModel.js";

export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const profilePhotoUrl = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: profilePhotoUrl },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
      },
    });
  } catch (error) {
    next(error);
  }
};
