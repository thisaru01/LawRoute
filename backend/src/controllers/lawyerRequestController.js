const lawyerRequestService = require("../services/lawyerRequestService");

// Create a new lawyer request (user describes their legal matter)
exports.createLawyerRequest = async (req, res, next) => {
  try {
    const { summary, lawyerId } = req.body;

    const request = await lawyerRequestService.createLawyerRequest({
      userId: req.user._id,
      summary,
      lawyerId,
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Get requests created by the logged-in user
exports.getMyLawyerRequests = async (req, res, next) => {
  try {
    const requests = await lawyerRequestService.getLawyerRequestsForUser(
      req.user._id,
    );

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
    const requests = await lawyerRequestService.getLawyerRequestsForLawyer(
      req.user._id,
    );

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

    const request = await lawyerRequestService.getLawyerRequestByIdForUser({
      requestId: id,
      currentUserId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Accept a lawyer request (only the assigned lawyer)
exports.acceptLawyerRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await lawyerRequestService.acceptLawyerRequest({
      requestId: id,
      lawyerId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Reject a lawyer request (only the assigned lawyer)
exports.rejectLawyerRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await lawyerRequestService.rejectLawyerRequest({
      requestId: id,
      lawyerId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
