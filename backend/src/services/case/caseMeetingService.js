import Case from "../../models/case/caseModel.js";
import CaseMeeting from "../../models/case/caseMeeting.js";

// Schedule a meeting for a case (assigned lawyer only)
export async function scheduleCaseMeeting({
  caseId,
  scheduledBy,
  date,
  time,
  method,
  meetingLink,
  location,
}) {
  const caseDoc = await Case.findById(caseId).select("lawyer user");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer =
    caseDoc.lawyer && caseDoc.lawyer.toString() === scheduledBy.toString();

  if (!isAssignedLawyer) {
    const error = new Error(
      "Only the assigned lawyer can schedule meetings for this case",
    );
    error.statusCode = 403;
    throw error;
  }

  // Basic backend guard: ensure required field depending on method
  if (method === "online" && !meetingLink) {
    const error = new Error("meetingLink is required for online meetings");
    error.statusCode = 400;
    throw error;
  }

  if (method === "physical" && !location) {
    const error = new Error("location is required for physical meetings");
    error.statusCode = 400;
    throw error;
  }

  const meeting = await CaseMeeting.create({
    caseId: caseDoc._id,
    scheduledBy,
    date,
    time,
    method,
    meetingLink,
    location,
  });

  return meeting;
}

// Get all meetings for a case (associated citizen or lawyer)
export async function getCaseMeetings({ caseId, currentUserId }) {
  const caseDoc = await Case.findById(caseId).select("user lawyer");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  const isUser =
    caseDoc.user && caseDoc.user.toString() === currentUserId.toString();
  const isLawyer =
    caseDoc.lawyer && caseDoc.lawyer.toString() === currentUserId.toString();

  if (!isUser && !isLawyer) {
    const error = new Error(
      "You are not allowed to view meetings for this case",
    );
    error.statusCode = 403;
    throw error;
  }

  const meetings = await CaseMeeting.find({ caseId })
    .populate("scheduledBy", "name email role")
    .sort({ createdAt: -1 });

  return meetings;
}

// Update a meeting (assigned lawyer only)
export async function updateCaseMeeting({ meetingId, currentUserId, updates }) {
  const meeting = await CaseMeeting.findById(meetingId);

  if (!meeting) {
    const error = new Error("Meeting not found");
    error.statusCode = 404;
    throw error;
  }

  const caseDoc = await Case.findById(meeting.caseId).select("lawyer");

  if (!caseDoc) {
    const error = new Error("Case not found for this meeting");
    error.statusCode = 404;
    throw error;
  }

  const isAssignedLawyer =
    caseDoc.lawyer && caseDoc.lawyer.toString() === currentUserId.toString();

  if (!isAssignedLawyer) {
    const error = new Error("Only the assigned lawyer can update this meeting");
    error.statusCode = 403;
    throw error;
  }

  // Compute final values after applying updates for validation
  const finalMethod =
    updates.method !== undefined ? updates.method : meeting.method;
  const finalMeetingLink =
    updates.meetingLink !== undefined
      ? updates.meetingLink
      : meeting.meetingLink;
  const finalLocation =
    updates.location !== undefined ? updates.location : meeting.location;

  if (finalMethod && !["online", "physical"].includes(finalMethod)) {
    const error = new Error("method must be either 'online' or 'physical'");
    error.statusCode = 400;
    throw error;
  }

  if (finalMethod === "online" && !finalMeetingLink) {
    const error = new Error("meetingLink is required for online meetings");
    error.statusCode = 400;
    throw error;
  }

  if (finalMethod === "physical" && !finalLocation) {
    const error = new Error("location is required for physical meetings");
    error.statusCode = 400;
    throw error;
  }

  // Apply provided updates
  const allowedFields = [
    "date",
    "time",
    "method",
    "meetingLink",
    "location",
    "status",
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      meeting[field] = updates[field];
    }
  });

  await meeting.save();

  return meeting;
}
