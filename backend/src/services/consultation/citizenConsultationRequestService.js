import ConsultationRequest from "../../models/consultation/consultationRequestModel.js";
import User from "../../models/userModel.js";

// Citizen: Create a new consultation request
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

  // Ensure the selected account exists and is a lawyer
  const lawyer = await User.findById(lawyerId).select("role");

  if (!lawyer || lawyer.role !== "lawyer") {
    const error = new Error("Selected user is not a lawyer");
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

// Citizen: Update a consultation request (only by the creating user and while pending)
export async function updateConsultationRequest({
  requestId,
  currentUserId,
  summary,
}) {
  if (!summary || !summary.trim()) {
    const error = new Error("Summary is required");
    error.statusCode = 400;
    throw error;
  }

  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isCreator =
    request.user && request.user.toString() === currentUserId.toString();

  if (!isCreator) {
    const error = new Error(
      "Only the user who created this request can update it",
    );
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error("Only pending requests can be updated");
    error.statusCode = 400;
    throw error;
  }

  request.summary = summary.trim();
  await request.save();

  return request;
}

// Citizen: Delete a consultation request (only by the creating user and while pending)
export async function deleteConsultationRequest({ requestId, currentUserId }) {
  const request = await ConsultationRequest.findById(requestId);

  if (!request) {
    const error = new Error("Request not found");
    error.statusCode = 404;
    throw error;
  }

  const isCreator =
    request.user && request.user.toString() === currentUserId.toString();

  if (!isCreator) {
    const error = new Error(
      "Only the user who created this request can delete it",
    );
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error("Only pending requests can be deleted");
    error.statusCode = 400;
    throw error;
  }

  await request.deleteOne();

  return { success: true };
}

// Citizen: Get consultation requests created by a specific user
export async function getConsultationRequestsForUser(userId) {
  const requests = await ConsultationRequest.find({ user: userId })
    .populate("lawyer", "name email role expertise")
    .sort({ createdAt: -1 });

  return requests;
}

// Shared: Get a single consultation request ensuring the requester has access
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
