import axios from "@/api/axios";

export const getMyLawyerProfile = () => {
  return axios.get("/lawyer-profile/me");
};

export const updateMyLawyerProfile = (data) => {
  return axios.put("/lawyer-profile/me", data);
};

/**
 * Fetch approved lawyer profiles (public, no auth required).
 * @param {object} params - Optional filters: { search, expertise, isFree }
 */
export const getApprovedLawyerProfiles = (params = {}) => {
  return axios.get("/lawyer-profile/approved", { params });
};
