import axios from "@/api/axios";

export const getMe = () => {
  return axios.get("/users/me");
};
