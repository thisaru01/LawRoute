import ConsultationRequest from "../../models/consultation/consultationRequestModel.js";
import Case from "../../models/case/caseModel.js";
import User from "../../models/userModel.js";

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

  await Case.create({
    consultationRequest: request._id,
    user: request.user,
    lawyer: request.lawyer,
  });

  // Notify the citizen that their consultation request was accepted.
  if (process.env.NODE_ENV !== "test") {
    (async () => {
      try {
        const [{ consultationAcceptedCitizenTemplate }, { sendEmail }] =
          await Promise.all([
            import("../email/consultationEmailTemplates.js"),
            import("../email/emailService.js"),
          ]);

        const [citizen, lawyer] = await Promise.all([
          User.findById(request.user).select("name email"),
          User.findById(request.lawyer).select("name"),
        ]);

        if (citizen?.email) {
          const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173/";
          const { subject, html } = consultationAcceptedCitizenTemplate({
            citizenName: citizen.name || "there",
            lawyerName: lawyer?.name || "your lawyer",
            loginUrl,
          });

          await sendEmail({ to: citizen.email, subject, html });
        }
      } catch (err) {
        console.error(
          "[Email] Failed to send consultation accepted notification:",
          err.message,
        );
      }
    })();
  }

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

  // Notify the citizen that their consultation request was rejected.
  if (process.env.NODE_ENV !== "test") {
    (async () => {
      try {
        const [{ consultationRejectedCitizenTemplate }, { sendEmail }] =
          await Promise.all([
            import("../email/consultationEmailTemplates.js"),
            import("../email/emailService.js"),
          ]);

        const [citizen, lawyer] = await Promise.all([
          User.findById(request.user).select("name email"),
          User.findById(request.lawyer).select("name"),
        ]);

        if (citizen?.email) {
          const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          const { subject, html } = consultationRejectedCitizenTemplate({
            citizenName: citizen.name || "there",
            lawyerName: lawyer?.name || "your lawyer",
            loginUrl,
          });

          await sendEmail({ to: citizen.email, subject, html });
        }
      } catch (err) {
        console.error(
          "[Email] Failed to send consultation rejected notification:",
          err.message,
        );
      }
    })();
  }

  return request;
}
