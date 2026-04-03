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

export const getPublishedArticles = () => {
  return axios.get("/articles/published");
};

export const updateArticleStatus = (id, status) => {
  return axios.patch(`/articles/${id}/status`, { status });
};

export default {
  getPendingOthersArticles,
  getMyArticles,
  getArticle,
  getPublishedArticles,
  updateArticleStatus,
};
