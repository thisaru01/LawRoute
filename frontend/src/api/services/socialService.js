import axios from "@/api/axios";

export const getMyPosts = (params = {}) => {
  return axios.get("/social/posts/me", { params });
};

export const createPost = (data) => {
  return axios.post("/social/posts", data);
};

export const updatePost = (postId, data) => {
  return axios.put(`/social/posts/${postId}`, data);
};

export const deletePost = (postId) => {
  return axios.delete(`/social/posts/${postId}`);
};

export const getLawyerPosts = (lawyerId, params = {}) => {
  return axios.get(`/social/lawyers/${lawyerId}/posts`, { params });
};

export const likePost = (postId) => {
  return axios.post(`/social/posts/${postId}/like`);
};

export const unlikePost = (postId) => {
  return axios.delete(`/social/posts/${postId}/like`);
};

export const getPostComments = (postId, params = {}) => {
  return axios.get(`/social/posts/${postId}/comments`, { params });
};

export const createComment = (postId, data) => {
  return axios.post(`/social/posts/${postId}/comments`, data);
};