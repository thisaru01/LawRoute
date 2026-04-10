import axios from "@/api/axios";

export const loginUser = (data) => {
  return axios.post("/auth/login", data);
};

export const registerUser = (data) => {
  return axios.post("/auth/register", data);
};

export const forgotPassword = (data) => {
  return axios.post("/auth/forgot-password", data);
};

export const resetPassword = (data) => {
  return axios.post("/auth/reset-password", data);
};
