import { randomBytes } from "crypto";
import Case from "../../models/case/caseModel.js";
import CaseMeeting from "../../models/case/caseMeeting.js";
import User from "../../models/userModel.js";

function generateJitsiMeetingLink(caseId) {
  const randomPart = randomBytes(8).toString("hex");
  const roomName = `lawroute-case-${caseId}-${randomPart}`;
  return `https://meet.jit.si/${roomName}`;
}

// Schedule a meeting for a case (assigned lawyer only)
export async function scheduleCaseMeeting({
  caseId,
  scheduledBy,
  date,
  time,
  method,
  location,
}) {
  const caseDoc = await Case.findById(caseId).select("lawyer user status");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  if (caseDoc.status === "closed") {
    const error = new Error("Cannot schedule a meeting for a closed case");
    error.statusCode = 400;
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

  if (method === "physical" && !location) {
    const error = new Error("location is required for physical meetings");
    error.statusCode = 400;
    throw error;
  }

  const meetingLink =
    method === "online"
      ? generateJitsiMeetingLink(caseDoc._id.toString())
      : undefined;

  const meeting = await CaseMeeting.create({
    caseId: caseDoc._id,
    scheduledBy,
    date,
    time,
    method,
    meetingLink,
    location: method === "physical" ? location : undefined,
    assignedUsers: [caseDoc.user, caseDoc.lawyer].filter(Boolean),
  });

  // Notify the citizen that a new meeting has been scheduled for this case.
  if (process.env.NODE_ENV !== "test") {
    (async () => {
      try {
        const [{ caseMeetingScheduledCitizenTemplate }, { sendEmail }] =
          await Promise.all([
            import("../email/caseMeetingEmailTemplates.js"),
            import("../email/emailService.js"),
          ]);

        const [citizen, lawyer] = await Promise.all([
          caseDoc.user
            ? User.findById(caseDoc.user).select("name email")
            : null,
          caseDoc.lawyer ? User.findById(caseDoc.lawyer).select("name") : null,
        ]);

        if (citizen?.email) {
          const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          const { subject, html } = caseMeetingScheduledCitizenTemplate({
            citizenName: citizen.name || "there",
            lawyerName: lawyer?.name || "your lawyer",
            date,
            time,
            method,
            location: method === "physical" ? location : undefined,
            loginUrl,
          });

          await sendEmail({ to: citizen.email, subject, html });
        }
      } catch (err) {
        console.error(
          "[Email] Failed to send case meeting scheduled notification:",
          err.message,
        );
      }
    })();
  }

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

  // Update any meetings that have passed their scheduled time from 'scheduled' -> 'incomplete'
  const now = new Date();
  for (const meeting of meetings) {
    if (meeting.status === "scheduled" && meeting.date) {
      const meetingDate = new Date(
        `${meeting.date}T${meeting.time || "00:00"}`,
      );
      if (!Number.isNaN(meetingDate.getTime()) && meetingDate < now) {
        meeting.status = "incomplete";
        // save the updated status (do not block other updates)
        // eslint-disable-next-line no-await-in-loop
        await meeting.save();
      }
    }
  }

  const sanitizedMeetings = meetings.map((meeting) => {
    const obj =
      typeof meeting.toObject === "function"
        ? meeting.toObject()
        : { ...meeting };
    if (obj.method === "online") {
      delete obj.meetingLink;
    }
    delete obj.assignedUsers;
    return obj;
  });

  return sanitizedMeetings;
}

export async function getJoinableCaseMeetingLink({ meetingId, currentUserId }) {
  const meeting = await CaseMeeting.findById(meetingId).select(
    "caseId method status meetingLink assignedUsers",
  );

  if (!meeting) {
    const error = new Error("Meeting not found");
    error.statusCode = 404;
    throw error;
  }

  if (meeting.method !== "online") {
    const error = new Error("This meeting does not have an online link");
    error.statusCode = 400;
    throw error;
  }

  if (!meeting.meetingLink) {
    const error = new Error("Meeting link is not available");
    error.statusCode = 500;
    throw error;
  }

  let assignedUsers = Array.isArray(meeting.assignedUsers)
    ? meeting.assignedUsers
    : [];

  if (!assignedUsers.length) {
    const caseDoc = await Case.findById(meeting.caseId).select("user lawyer");

    if (!caseDoc) {
      const error = new Error("Case not found for this meeting");
      error.statusCode = 404;
      throw error;
    }

    assignedUsers = [caseDoc.user, caseDoc.lawyer].filter(Boolean);
  }

  const isAssigned = assignedUsers.some(
    (userId) => userId && userId.toString() === currentUserId.toString(),
  );

  if (!isAssigned) {
    const error = new Error("You are not allowed to join this meeting");
    error.statusCode = 403;
    throw error;
  }

  return meeting.meetingLink;
}

// Update a meeting (assigned lawyer only)
export async function updateCaseMeeting({ meetingId, currentUserId, updates }) {
  const meeting = await CaseMeeting.findById(meetingId);

  if (!meeting) {
    const error = new Error("Meeting not found");
    error.statusCode = 404;
    throw error;
  }

  const caseDoc = await Case.findById(meeting.caseId).select("lawyer user");

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

  // Notify the citizen about meeting updates or cancellation.
  if (process.env.NODE_ENV !== "test") {
    (async () => {
      try {
        const [
          {
            caseMeetingUpdatedCitizenTemplate,
            caseMeetingCancelledCitizenTemplate,
          },
          { sendEmail },
        ] = await Promise.all([
          import("../email/caseMeetingEmailTemplates.js"),
          import("../email/emailService.js"),
        ]);

        const citizen = caseDoc.user
          ? await User.findById(caseDoc.user).select("name email")
          : null;
        const lawyer = caseDoc.lawyer
          ? await User.findById(caseDoc.lawyer).select("name")
          : null;

        if (citizen?.email) {
          const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";

          const templateFn =
            meeting.status === "cancelled"
              ? caseMeetingCancelledCitizenTemplate
              : caseMeetingUpdatedCitizenTemplate;

          const { subject, html } = templateFn({
            citizenName: citizen.name || "there",
            lawyerName: lawyer?.name || "your lawyer",
            date: meeting.date,
            time: meeting.time,
            method: meeting.method,
            location:
              meeting.method === "physical" ? meeting.location : undefined,
            loginUrl,
          });

          await sendEmail({ to: citizen.email, subject, html });
        }
      } catch (err) {
        console.error(
          "[Email] Failed to send case meeting update notification:",
          err.message,
        );
      }
    })();
  }

  return meeting;
}
