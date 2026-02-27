import mongoose from "mongoose";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate lawyerId path parameter for follow/unfollow actions. 
export const validateLawyerIdParam = (req, res, next) => {
  const { lawyerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
    return next(buildError("Invalid lawyer id", 400));
  }

  return next();
};
