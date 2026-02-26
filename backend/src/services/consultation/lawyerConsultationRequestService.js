import ConsultationRequest from "../../models/consultation/consultationRequestModel.js";

// Lawyer: Get consultation requests assigned to a specific lawyer
export async function getConsultationRequestsForLawyer(lawyerId) {
  const requests = await ConsultationRequest.find({ lawyer: lawyerId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return requests;
}

// Lawyer: Accept a consultation request as the assigned lawyer
export async function acceptConsultationRequest({ requestId, lawyerId }) {
  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer = request.lawyer.toString() === lawyerId.toString();

  if (!isAssignedLawyer) {
    const error = new Error("Only the assigned lawyer can accept this request");
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error("This request has already been responded to");
    error.statusCode = 400;
    throw error;
  }

  request.status = "accepted";
  await request.save();

  return request;
}

// Lawyer: Reject a consultation request as the assigned lawyer
export async function rejectConsultationRequest({ requestId, lawyerId }) {
  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer = request.lawyer.toString() === lawyerId.toString();

  if (!isAssignedLawyer) {
    const error = new Error("Only the assigned lawyer can reject this request");
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error("This request has already been responded to");
    error.statusCode = 400;
    throw error;
  }

  request.status = "rejected";
  await request.save();

  return request;
}
