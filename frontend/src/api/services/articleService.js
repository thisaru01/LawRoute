import axios from "@/api/axios";

export const getPendingOthersArticles = () => {
  return axios.get("/articles/pending/others");
};

export const getMyArticles = () => {
  return axios.get("/articles/me");
};

export const getArticle = (id) => {
  return axios.get(`/articles/${id}`);
};

export default {
  getPendingOthersArticles,
  getMyArticles,
  getArticle,
};
