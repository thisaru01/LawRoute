import ConsultationRequest from "../models/consultationRequestModel.js";

// Create a new consultation request
export async function createConsultationRequest({ userId, summary, lawyerId }) {
  if (!summary || !summary.trim()) {
    const error = new Error("Summary is required");
    error.statusCode = 400;
    throw error;
  }

  if (!lawyerId) {
    const error = new Error("A lawyer must be selected");
    error.statusCode = 400;
    throw error;
  }

  const request = await ConsultationRequest.create({
    user: userId,
    lawyer: lawyerId,
    summary: summary.trim(),
  });

  return request;
}

// Get consultation requests created by a specific user
export async function getConsultationRequestsForUser(userId) {
  const requests = await ConsultationRequest.find({ user: userId })
    .populate("lawyer", "name email role expertise")
    .sort({ createdAt: -1 });

  return requests;
}

// Get consultation requests assigned to a specific lawyer
export async function getConsultationRequestsForLawyer(lawyerId) {
  const requests = await ConsultationRequest.find({ lawyer: lawyerId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return requests;
}

// Get a single consultation request ensuring the requester has access
export async function getConsultationRequestByIdForUser({
  requestId,
  currentUserId,
}) {
  const request = await ConsultationRequest.findById(requestId)
    .populate("user", "name email")
    .populate("lawyer", "name email role expertise");

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isUser =
    request.user && request.user._id.toString() === currentUserId.toString();
  const isLawyer =
    request.lawyer &&
    request.lawyer._id.toString() === currentUserId.toString();

  if (!isUser && !isLawyer) {
    const error = new Error("You are not allowed to view this request");
    error.statusCode = 403;
    throw error;
  }

  return request;
}

// Accept a consultation request as the assigned lawyer
export async function acceptConsultationRequest({ requestId, lawyerId }) {
  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer = request.lawyer.toString() === lawyerId.toString();

  if (!isAssignedLawyer) {
    const error = new Error(
      "Only the assigned lawyer can accept this request",
    );
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

// Reject a consultation request as the assigned lawyer
export async function rejectConsultationRequest({ requestId, lawyerId }) {
  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer = request.lawyer.toString() === lawyerId.toString();

  if (!isAssignedLawyer) {
    const error = new Error(
      "Only the assigned lawyer can reject this request",
    );
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
