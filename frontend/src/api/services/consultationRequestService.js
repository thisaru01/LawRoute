import axios from "@/api/axios";

export const getMyConsultationRequests = () => {
  return axios.get("/consultation-requests/me");
};

export const createConsultationRequest = (data) => {
  return axios.post("/consultation-requests", data);
};

export const acceptConsultationRequest = (id) => {
  return axios.patch(`/consultation-requests/${id}/accept`);
};

export const rejectConsultationRequest = (id) => {
  return axios.patch(`/consultation-requests/${id}/reject`);
};
