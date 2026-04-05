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