import axios from "@/api/axios";

export const getMyConsultationRequests = () => {
  return axios.get("/consultation-requests/me");
};
