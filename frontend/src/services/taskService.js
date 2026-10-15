import apiClient from "../api/apiClient";

// =========================================================
// TASK SERVICES
// =========================================================

export const getTasks = async () => {
  const response = await apiClient.get(
    "/admin/tasks"
  );

  return response.data;
};

export const getTaskById = async (
  taskId
) => {
  const response = await apiClient.get(
    `/admin/tasks/${taskId}`
  );

  return response.data;
};

export const getProjectTasks = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/tasks/project/${projectId}`
  );

  return response.data;
};

export const getSprintTasks = async (
  sprintId
) => {
  const response = await apiClient.get(
    `/admin/tasks/sprint/${sprintId}`
  );

  return response.data;
};

export const getTasksBySprint =
  getSprintTasks;

export const createTask = async (
  taskData
) => {

  console.log(
    "Creating task:",
    taskData
  );

  const response = await apiClient.post(
    "/admin/tasks",
    taskData
  );

  return response.data;
};

export const updateTask = async (
  taskId,
  taskData
) => {
  const response = await apiClient.put(
    `/admin/tasks/${taskId}`,
    taskData
  );

  return response.data;
};

export const deleteTask = async (
  taskId
) => {
  const response = await apiClient.delete(
    `/admin/tasks/${taskId}`
  );

  return response.data;
};