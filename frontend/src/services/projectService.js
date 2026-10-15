import apiClient from "../api/apiClient";

// =========================================================
// PROJECT SERVICES
// =========================================================

export const getProjects = async () => {
  const response = await apiClient.get(
    "/admin/projects"
  );

  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await apiClient.get(
    `/admin/projects/${projectId}`
  );

  return response.data;
};

export const createProject = async (projectData) => {
  const response = await apiClient.post(
    "/admin/projects",
    projectData
  );

  return response.data;
};

export const updateProject = async (
  projectId,
  projectData
) => {
  const response = await apiClient.put(
    `/admin/projects/${projectId}`,
    projectData
  );

  return response.data;
};

export const deleteProject = async (
  projectId
) => {
  const response = await apiClient.delete(
    `/admin/projects/${projectId}`
  );

  return response.data;
};

// =========================================================
// PROJECT SPRINT SERVICES
// =========================================================

export const getSprintsByProject = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/projects/${projectId}/sprints`
  );

  return response.data;
};

// =========================================================
// PROJECT TASK SERVICES
// =========================================================

export const getProjectTasks = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/tasks/project/${projectId}`
  );

  return response.data;
};
