import Case from "../../models/case/caseModel.js";

// Get cases for the current user (citizen or lawyer)

export async function getMyCases({ userId, role }) {
  let filter = {};

  if (role === "lawyer") {
    filter = { lawyer: userId };
  } else {
    filter = { user: userId };
  }

  const cases = await Case.find(filter)
    .populate("user", "name email role")
    .populate("lawyer", "name email role")
    .populate("consultationRequest", "summary status createdAt")
    .sort({ createdAt: -1 });

  return cases;
}

// Get a single case by id for current user (citizen or lawyer)
export async function getCaseById({ caseId, currentUserId }) {
  const caseDoc = await Case.findById(caseId)
    .populate("user", "name email role")
    .populate("lawyer", "name email role")
    .populate("consultationRequest", "summary status createdAt");

  if (!caseDoc) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  const isUser =
    caseDoc.user && caseDoc.user._id.toString() === currentUserId.toString();
  const isLawyer =
    caseDoc.lawyer &&
    caseDoc.lawyer._id.toString() === currentUserId.toString();

  if (!isUser && !isLawyer) {
    const error = new Error("You are not allowed to view this case");
    error.statusCode = 403;
    throw error;
  }

  return caseDoc;
}
