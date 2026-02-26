import * as consultationRequestService from "../services/consultationRequestService.js";

// Create a new consultation request (user describes their legal matter)
export const createConsultationRequest = async (req, res, next) => {
  try {
    const { summary, lawyerId } = req.body;

    const request = await consultationRequestService.createConsultationRequest({
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

// Get consultation requests created by the logged-in user
export const getMyConsultationRequests = async (req, res, next) => {
  try {
    const requests =
      await consultationRequestService.getConsultationRequestsForUser(
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

// Get consultation requests assigned to the logged-in lawyer
export const getAssignedConsultationRequestsForLawyer = async (
  req,
  res,
  next,
) => {
  try {
    const requests =
      await consultationRequestService.getConsultationRequestsForLawyer(
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

// Get a single consultation request (only by involved user or assigned lawyer)
export const getConsultationRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request =
      await consultationRequestService.getConsultationRequestByIdForUser({
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

// Accept a consultation request (only the assigned lawyer)
export const acceptConsultationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await consultationRequestService.acceptConsultationRequest({
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

// Reject a consultation request (only the assigned lawyer)
export const rejectConsultationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await consultationRequestService.rejectConsultationRequest({
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
