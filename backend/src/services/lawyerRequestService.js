const LawyerRequest = require("../models/lawyerRequestModel");

// Create a new lawyer request
async function createLawyerRequest({ userId, summary, lawyerId }) {
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

  const request = await LawyerRequest.create({
    user: userId,
    lawyer: lawyerId,
    summary: summary.trim(),
  });

  return request;
}

// Get requests created by a specific user
async function getLawyerRequestsForUser(userId) {
  const requests = await LawyerRequest.find({ user: userId })
    .populate("lawyer", "name email role expertise")
    .sort({ createdAt: -1 });

  return requests;
}

// Get requests assigned to a specific lawyer
async function getLawyerRequestsForLawyer(lawyerId) {
  const requests = await LawyerRequest.find({ lawyer: lawyerId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return requests;
}

// Get a single request ensuring the requester has access
async function getLawyerRequestByIdForUser({ requestId, currentUserId }) {
  const request = await LawyerRequest.findById(requestId)
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

// Accept a request as the assigned lawyer
async function acceptLawyerRequest({ requestId, lawyerId }) {
  const request = await LawyerRequest.findById(requestId);

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

// Reject a request as the assigned lawyer
async function rejectLawyerRequest({ requestId, lawyerId }) {
  const request = await LawyerRequest.findById(requestId);

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

module.exports = {
  createLawyerRequest,
  getLawyerRequestsForUser,
  getLawyerRequestsForLawyer,
  getLawyerRequestByIdForUser,
  acceptLawyerRequest,
  rejectLawyerRequest,
};
