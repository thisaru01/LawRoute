import axios from "@/api/axios";

/**
 * Admin: list lawyer profiles for moderation.
 * @param {object} params - Optional filters such as { verificationStatus }
 */
export const getAdminLawyerProfiles = (params = {}) => {
  return axios.get("/lawyer-profile/admin/lawyers", { params });
};

/**
 * Admin: update a lawyer's verification status.
 * @param {string} userId - Lawyer user id
 * @param {"pending"|"approved"|"rejected"} verificationStatus
 */
export const updateAdminLawyerVerificationStatus = (
  userId,
  verificationStatus,
) => {
  return axios.patch(
    `/lawyer-profile/admin/lawyers/${userId}/verification-status`,
    { verificationStatus },
  );
};
