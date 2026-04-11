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

export const updateArticle = (id, data) => {
  return axios.put(`/articles/${id}`, data);
};

export const deleteArticle = (id) => {
  return axios.delete(`/articles/${id}`);
};

export const getArticlesByStatus = (status) => {
  return axios.get("/articles", { params: { status } });
};

export default {
  getPendingOthersArticles,
  getMyArticles,
  getArticle,
  getPublishedArticles,
  updateArticleStatus,
  updateArticle,
  getArticlesByStatus,
};
