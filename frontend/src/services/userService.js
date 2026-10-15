import apiClient from "../api/axiosClient";

// =========================================================
// USER SERVICES
// =========================================================

export const getUsers = async () => {
  const response = await apiClient.get(
    "/admin/users"
  );

  return response.data;
};

export const getAssignees = async () => {
  const response = await apiClient.get(
    "/admin/users"
  );

  return response.data;
};
