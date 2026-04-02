import axios from "@/api/axios";

export const getPendingOthersArticles = () => {
  return axios.get("/articles/pending/others");
};

export const getMyArticles = () => {
  return axios.get("/articles/me");
};

export default {
  getPendingOthersArticles,
  getMyArticles,
};
