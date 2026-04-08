import axios from "@/api/axios";

export const getMyCases = () => {
  return axios.get("/cases/my");
};

export const closeCase = (id) => {
  return axios.patch(`/cases/${id}/close`);
};

export const getCaseById = (id) => {
  return axios.get(`/cases/${id}`);
};

export const getCaseMeetings = (caseId) => {
  return axios.get(`/cases/${caseId}/meetings`);
};

export const scheduleCaseMeeting = (caseId, payload) => {
  return axios.post(`/cases/${caseId}/meetings`, payload);
};

export const getCaseDocuments = (caseId) => {
  return axios.get(`/cases/${caseId}/documents`);
};

export const uploadCaseDocument = (caseId, file, title, description) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (description) {
    formData.append("description", description);
  }
  return axios.post(`/cases/${caseId}/documents`, formData);
};

export const updateCaseDocument = (docId, title, description) => {
  return axios.patch(`/cases/documents/${docId}`, { title, description });
};

export const deleteCaseDocument = (docId) => {
  return axios.delete(`/cases/documents/${docId}`);
};
