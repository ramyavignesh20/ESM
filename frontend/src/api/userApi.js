import axiosClient from "./axiosClientApi";

// ======================================================
// USER API
// Base URL is handled by axiosClientApi
// ======================================================

// Get all users
export const getUsers = async () => {
  const response = await axiosClient.get("/admin/users");
  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/admin/users/${id}`);
  return response.data;
};

// Create a new user
export const createUser = async (userData) => {
  const response = await axiosClient.post("/admin/users", userData);
  return response.data;
};

// Update an existing user
export const updateUser = async (id, userData) => {
  const response = await axiosClient.put(`/admin/users/${id}`, userData);
  return response.data;
};

// Delete a user
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/admin/users/${id}`);
  return response.data;
};

// Activate a user
export const activateUser = async (id) => {
  const response = await axiosClient.patch(`/admin/users/${id}/activate`);
  return response.data;
};

// Deactivate a user
export const deactivateUser = async (id) => {
  const response = await axiosClient.patch(`/admin/users/${id}/deactivate`);
  return response.data;
};

// Get currently logged-in user
export const getCurrentUser = async () => {
  const response = await axiosClient.get("/user/me");
  return response.data;
};

export const updateUserProfile = async (profile) => {
  const response = await axiosClient.put("/user/profile", profile);
  return response.data;
};

export const getUserDashboard = async () => {
  const response = await axiosClient.get("/user/dashboard");
  return response.data;
};

export const updateTaskProgress = async (taskId, columnId, status) => {
  const response = await axiosClient.put(`/user/tasks/${taskId}/progress`, {
    columnId,
    status,
  });
  return response.data;
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getCurrentUser,
  updateUserProfile,
  getUserDashboard,
  updateTaskProgress,
};
