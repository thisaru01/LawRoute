import axios from "@/api/axios";

export const getMyCases = () => {
  return axios.get("/cases/my");
};

export const closeCase = (id) => {
  return axios.patch(`/cases/${id}/close`);
};
