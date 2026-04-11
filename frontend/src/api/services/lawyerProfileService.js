import axios from "@/api/axios";

export const getMyLawyerProfile = () => {
  return axios.get("/lawyer-profile/me");
};

export const updateMyLawyerProfile = (data) => {
  return axios.put("/lawyer-profile/me", data);
};

export const getLawyerDashboardStats = () => {
  return axios.get("/lawyer-profile/dashboard/stats");
};

/**
 * Fetch approved lawyer profiles (public, no auth required).
 * @param {object} params - Optional filters: { search, expertise, isFree }
 */
export const getApprovedLawyerProfiles = (params = {}) => {
  return axios.get("/lawyer-profile/approved", { params });
};

/**
 * Fetch a single lawyer profile (public, no auth required).
 * @param {string} id - The lawyer profile ID or associated user ID.
 */
export const getPublicLawyerProfile = (id) => {
  return axios.get(`/lawyer-profile/${id}`);
};
