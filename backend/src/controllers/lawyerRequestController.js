const LawyerRequest = require("../models/lawyerRequestModel");

// Create a new lawyer request (user describes their legal matter)
exports.createLawyerRequest = async (req, res, next) => {
  try {
    const { summary, lawyerId } = req.body;

    if (!summary || !summary.trim()) {
      return res.status(400).json({
        success: false,
        message: "Summary is required",
      });
    }

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: "A lawyer must be selected",
      });
    }

    const request = await LawyerRequest.create({
      user: req.user._id,
      lawyer: lawyerId,
      summary: summary.trim(),
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Get requests created by the logged-in user
exports.getMyLawyerRequests = async (req, res, next) => {
  try {
    const requests = await LawyerRequest.find({ user: req.user._id })
      .populate("lawyer", "name email role expertise")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Get requests assigned to the logged-in lawyer
exports.getAssignedRequestsForLawyer = async (req, res, next) => {
  try {
    const requests = await LawyerRequest.find({ lawyer: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};
