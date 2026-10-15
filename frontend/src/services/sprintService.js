import apiClient from "../api/apiClient";

// =========================================================
// SPRINT SERVICES
// =========================================================

export const getSprints = async () => {
  const response = await apiClient.get(
    "/admin/sprints"
  );

  return response.data;
};

export const getSprintById = async (
  sprintId
) => {
  const response = await apiClient.get(
    `/admin/sprints/${sprintId}`
  );

  return response.data;
};

export const getSprintsByProject = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/projects/${projectId}/sprints`
  );

  return response.data;
};

export const createSprint = async (
  sprintData
) => {
  const response = await apiClient.post(
    "/admin/sprints",
    sprintData
  );

  return response.data;
};

export const updateSprint = async (
  sprintId,
  sprintData
) => {
  const response = await apiClient.put(
    `/admin/sprints/${sprintId}`,
    sprintData
  );

  return response.data;
};

export const deleteSprint = async (
  sprintId
) => {
  const response = await apiClient.delete(
    `/admin/sprints/${sprintId}`
  );

  return response.data;
};
