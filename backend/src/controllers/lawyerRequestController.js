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

// Get a single lawyer request (only by involved user or assigned lawyer)
exports.getLawyerRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await LawyerRequest.findById(id)
      .populate("user", "name email")
      .populate("lawyer", "name email role expertise");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const isUser =
      request.user && request.user._id.toString() === req.user._id.toString();
    const isLawyer =
      request.lawyer &&
      request.lawyer._id.toString() === req.user._id.toString();

    if (!isUser && !isLawyer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this request",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Accept a lawyer request (only the assigned lawyer)
exports.acceptLawyerRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await LawyerRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const isAssignedLawyer =
      request.lawyer.toString() === req.user._id.toString();

    if (!isAssignedLawyer) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned lawyer can accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been responded to",
      });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Reject a lawyer request (only the assigned lawyer)
exports.rejectLawyerRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await LawyerRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const isAssignedLawyer =
      request.lawyer.toString() === req.user._id.toString();

    if (!isAssignedLawyer) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned lawyer can reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been responded to",
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
