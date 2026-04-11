import axios from "@/api/axios";

export const getMe = () => {
  return axios.get("/users/me");
};

export const updateMe = (data) => {
  return axios.put("/users/me", data);
};

export const updateProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  return axios.put("/users/me/profile-photo", formData);
};

export const changePassword = ({ currentPassword, newPassword }) => {
  return axios.put("/users/me/password", { currentPassword, newPassword });
};
