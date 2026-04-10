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
 * Get a single civil issue.
 */
export const getCivilIssueById = (issueId) => {
  return axios.get(`/civil-issues/${issueId}`);
};

/**
 * Get all publicly shared civil issues (No auth required).
 */
export const getPublicCivilIssues = (params = {}) => {
  return axios.get("/civil-issues/public", { params });
};

/**
 * Get all civil issues assigned to the current authority.
 */
export const getAssignedCivilIssues = () => {
  return axios.get("/civil-issues/assigned");
};

/**
 * Update an existing civil issue.
 */
export const updateCivilIssue = (issueId, payload) => {
  return axios.patch(`/civil-issues/${issueId}`, payload);
};

/**
 * Delete an existing civil issue.
 */
export const deleteCivilIssue = (issueId) => {
  return axios.delete(`/civil-issues/${issueId}`);
};
