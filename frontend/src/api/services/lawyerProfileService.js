import axios from "@/api/axios";

export const getMyLawyerProfile = () => {
  return axios.get("/lawyer-profile/me");
};

export const updateMyLawyerProfile = (data) => {
  return axios.put("/lawyer-profile/me", data);
};
