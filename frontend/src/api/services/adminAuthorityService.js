import axios from "@/api/axios";

/**
 * Admin: list authority profiles.
 */
export const getAdminAuthorityProfiles = () => {
  return axios.get("/authority-profiles/admin");
};

/**
 * Admin: delete an authority profile and user.
 * @param {string} profileId 
 */
export const deleteAdminAuthority = (profileId) => {
  return axios.delete(`/authority-profiles/${profileId}`);
};

/**
 * Admin: update an authority's password.
 * @param {string} profileId 
 * @param {string} password 
 */
export const updateAdminAuthorityPassword = (profileId, password) => {
  return axios.patch(`/authority-profiles/${profileId}/password`, { password });
};
