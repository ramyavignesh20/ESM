import axiosClient from "./axiosClientApi";

// Get all sprints
export const getSprints = async () => {
  const response = await axiosClient.get("/admin/sprints");
  return response.data;
};

// Get a sprint by ID
export const getSprintById = async (id) => {
  const response = await axiosClient.get(`/admin/sprints/${id}`);
  return response.data;
};

// Get sprints for a specific project
export const getSprintsByProject = async (projectId) => {
  const response = await axiosClient.get(
    `/admin/projects/${projectId}/sprints`
  );
  return response.data;
};

// Create a sprint
export const createSprint = async (sprintData) => {
  const response = await axiosClient.post("/admin/sprints", {
    name: sprintData.name,
    goal: sprintData.goal || "",
    startDate: sprintData.startDate,
    endDate: sprintData.endDate,
    status: sprintData.status || "PLANNED",
    projectId:
      sprintData.projectId ??
      sprintData.project?.id ??
      null,
  });

  return response.data;
};

// Update a sprint
export const updateSprint = async (id, sprintData) => {
  const response = await axiosClient.put(`/admin/sprints/${id}`, {
    name: sprintData.name,
    goal: sprintData.goal || "",
    startDate: sprintData.startDate,
    endDate: sprintData.endDate,
    status: sprintData.status || "PLANNED",
    projectId:
      sprintData.projectId ??
      sprintData.project?.id ??
      null,
  });

  return response.data;
};

// Delete a sprint
export const deleteSprint = async (id) => {
  const response = await axiosClient.delete(`/admin/sprints/${id}`);
  return response.data;
};

// Start a sprint
export const startSprint = async (id) => {
  const response = await axiosClient.put(`/admin/sprints/${id}/start`);
  return response.data;
};

// Complete a sprint
export const completeSprint = async (id) => {
  const response = await axiosClient.put(`/admin/sprints/${id}/complete`);
  return response.data;
};

// Cancel a sprint
export const cancelSprint = async (id) => {
  const response = await axiosClient.put(`/admin/sprints/${id}/cancel`);
  return response.data;
};

export default {
  getSprints,
  getSprintById,
  getSprintsByProject,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  cancelSprint,
};