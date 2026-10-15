import axiosClient from "./axiosClientApi";

// ===============================
// GET ALL TASKS
// ===============================
export const getTasks = async () => {
  const response = await axiosClient.get("/admin/tasks");
  return response.data;
};

// ===============================
// GET SINGLE TASK
// ===============================
export const getTask = async (id) => {
  const response = await axiosClient.get(`/admin/tasks/${id}`);
  return response.data;
};

// ===============================
// GET TASKS BY PROJECT
// ===============================
export const getProjectTasks = async (projectId) => {
  const response = await axiosClient.get(
    `/admin/tasks/project/${projectId}`
  );
  return response.data;
};

// ===============================
// GET TASKS BY SPRINT
// ===============================
export const getSprintTasks = async (sprintId) => {
  const response = await axiosClient.get(
    `/admin/tasks/sprint/${sprintId}`
  );
  return response.data;
};

// ===============================
// CREATE TASK
// ===============================
export const createTask = async (taskData) => {
  const response = await axiosClient.post(
    "/admin/tasks",
    taskData
  );
  return response.data;
};

// ===============================
// UPDATE TASK
// ===============================
export const updateTask = async (id, taskData) => {
  const response = await axiosClient.put(
    `/admin/tasks/${id}`,
    taskData
  );
  return response.data;
};

// ===============================
// DELETE TASK
// ===============================
export const deleteTask = async (id) => {
  const response = await axiosClient.delete(
    `/admin/tasks/${id}`
  );
  return response.data;
};