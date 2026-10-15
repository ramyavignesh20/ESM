import axiosClient from "./axiosClientApi";

// Get all projects
export const getProjects = async () => {
  const response = await axiosClient.get("/admin/projects");
  return response.data;
};

// Get project by ID
export const getProjectById = async (projectId) => {
  const response = await axiosClient.get(`/admin/projects/${projectId}`);
  return response.data;
};

// Create project
export const createProject = async (projectData) => {
  const response = await axiosClient.post("/admin/projects", projectData);
  return response.data;
};

// Update project
export const updateProject = async (projectId, projectData) => {
  const response = await axiosClient.put(
    `/admin/projects/${projectId}`,
    projectData
  );
  return response.data;
};

// Delete project
export const deleteProject = async (projectId) => {
  const response = await axiosClient.delete(
    `/admin/projects/${projectId}`
  );
  return response.data;
};

// Get sprints for a project
export const getProjectSprints = async (projectId) => {
  const response = await axiosClient.get(
    `/admin/projects/${projectId}/sprints`
  );
  return response.data;
};

// Get tasks for a project
export const getProjectTasks = async (projectId) => {
  const response = await axiosClient.get(
    `/admin/projects/${projectId}/tasks`
  );
  return response.data;
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectSprints,
  getProjectTasks,
};