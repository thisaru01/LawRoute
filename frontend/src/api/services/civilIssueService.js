import axios from "@/api/axios";

/**
 * Submit a new civil issue.
 * Supports file attachments via FormData.
 */
export const submitCivilIssue = (formData) => {
  return axios.post("/civil-issues", formData);
};

/**
 * Get all civil issues submitted by the current citizen.
 */
export const getMyCivilIssues = () => {
  return axios.get("/civil-issues/my");
};

/**
 * Get all publicly shared civil issues (No auth required).
 */
export const getPublicCivilIssues = () => {
  return axios.get("/civil-issues/public");
};

/**
 * Get all civil issues assigned to the current authority.
 */
export const getAssignedCivilIssues = () => {
  return axios.get("/civil-issues/assigned");
};
