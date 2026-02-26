import Case from "../../models/case/caseModel.js";

// Get cases for the currently authenticated user (citizen, lawyer, or admin)
// - Lawyers see cases where they are the `lawyer`
// - All other roles (including admin) see cases where they are the `user`
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
