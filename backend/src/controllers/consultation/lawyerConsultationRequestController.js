import * as consultationRequestService from "../../services/consultation/lawyerConsultationRequestService.js";

// Lawyer: Get consultation requests assigned to the logged-in lawyer
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

// Lawyer: Accept a consultation request (only the assigned lawyer)
export const acceptConsultationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await consultationRequestService.acceptConsultationRequest({
      requestId: id,
      lawyerId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Consultation request accepted and case opened successfully",
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

// Lawyer: Reject a consultation request (only the assigned lawyer)
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
