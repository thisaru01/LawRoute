import * as consultationRequestService from "../../services/consultation/citizenConsultationRequestService.js";
import * as lawyerConsultationRequestService from "../../services/consultation/lawyerConsultationRequestService.js";

// Citizen: Create a new consultation request (user describes their legal matter)
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

// Citizen/Lawyer: Get consultation requests related to the logged-in user
export const getMyConsultationRequests = async (req, res, next) => {
  try {
    let requests;

    if (req.user.role === "lawyer") {
      requests =
        await lawyerConsultationRequestService.getConsultationRequestsForLawyer(
          req.user._id,
        );
    } else {
      requests =
        await consultationRequestService.getConsultationRequestsForUser(
          req.user._id,
        );
    }

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Shared access: Get a single consultation request (only by involved user or assigned lawyer)
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

// Citizen: Update a consultation request summary (only by creator while pending)
export const updateConsultationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;

    if (
      Object.prototype.hasOwnProperty.call(req.body, "lawyer") ||
      Object.prototype.hasOwnProperty.call(req.body, "lawyerId")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You are not allowed to change the assigned lawyer for this request",
      });
    }

    const request = await consultationRequestService.updateConsultationRequest({
      requestId: id,
      currentUserId: req.user._id,
      summary,
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

// Citizen: Delete a consultation request (only by creator while pending)
export const deleteConsultationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    await consultationRequestService.deleteConsultationRequest({
      requestId: id,
      currentUserId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Consultation request deleted successfully",
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
