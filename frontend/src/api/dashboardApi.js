import axiosClient from "./axiosClientApi";

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboard = async () => {
  const response = await axiosClient.get("/admin/dashboard");
  return response.data;
};

/**
 * Get normal user dashboard statistics
 */
export const getUserDashboard = async () => {
  const response = await axiosClient.get("/user/dashboard");
  return response.data;
};

/**
 * Get overall dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await axiosClient.get("/dashboard/stats");
  return response.data;
};

/**
 * Get project statistics
 */
export const getProjectStats = async () => {
  const response = await axiosClient.get("/dashboard/projects");
  return response.data;
};

/**
 * Get sprint statistics
 */
export const getSprintStats = async () => {
  const response = await axiosClient.get("/dashboard/sprints");
  return response.data;
};

/**
 * Get task statistics
 */
export const getTaskStats = async () => {
  const response = await axiosClient.get("/dashboard/tasks");
  return response.data;
};

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async () => {
  const response = await axiosClient.get("/dashboard/summary");
  return response.data;
};
