import axios from "axios";

// ======================================================
// AXIOS CLIENT
// ======================================================

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// REQUEST INTERCEPTOR - JWT
// ======================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url
    );

    console.log(
      "JWT exists:",
      !!token
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.config?.method?.toUpperCase(),
      error.config?.url
    );

    if (error.response?.status === 401) {
      console.error(
        "401 Unauthorized - JWT invalid or expired"
      );
    }

    if (error.response?.status === 403) {
      console.error(
        "403 Forbidden - User does not have permission"
      );
    }

    return Promise.reject(error);
  }
);

// ======================================================
// AUTH
// ======================================================

export const login = async (loginData) => {
  const response = await apiClient.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

// Backward-compatible name
export const loginUser = login;

export const register = async (registerData) => {
  const response = await apiClient.post(
    "/auth/register",
    registerData
  );

  return response.data;
};

// ======================================================
// PROJECT API
// ======================================================

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

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(
    `/admin/projects/${projectId}`
  );

  return response.data;
};

// ======================================================
// SPRINT API
// ======================================================

export const getSprints = async () => {
  const response = await apiClient.get(
    "/admin/sprints"
  );

  return response.data;
};

export const getSprintById = async (sprintId) => {
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

export const createSprint = async (sprintData) => {
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

export const deleteSprint = async (sprintId) => {
  const response = await apiClient.delete(
    `/admin/sprints/${sprintId}`
  );

  return response.data;
};

// ======================================================
// TASK API
// ======================================================

export const getTasks = async () => {
  const response = await apiClient.get(
    "/admin/tasks"
  );

  return response.data;
};

// ------------------------------------------------------
// GET TASKS BY PROJECT
// ------------------------------------------------------

export const getProjectTasks = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/tasks/project/${projectId}`
  );

  return response.data;
};

// ------------------------------------------------------
// GET TASKS BY SPRINT
// ------------------------------------------------------

export const getSprintTasks = async (
  sprintId
) => {
  const response = await apiClient.get(
    `/admin/tasks/sprint/${sprintId}`
  );

  return response.data;
};

// Existing alternate name
export const getTasksBySprint = getSprintTasks;

// ------------------------------------------------------
// GET TASK
// ------------------------------------------------------

export const getTaskById = async (taskId) => {
  const response = await apiClient.get(
    `/admin/tasks/${taskId}`
  );

  return response.data;
};

// ------------------------------------------------------
// CREATE TASK
// ------------------------------------------------------

export const createTask = async (taskData) => {
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

// ------------------------------------------------------
// UPDATE TASK
// ------------------------------------------------------

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

// ------------------------------------------------------
// DELETE TASK
// ------------------------------------------------------

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(
    `/admin/tasks/${taskId}`
  );

  return response.data;
};

export const moveTaskToColumn = async (taskId, columnId) => {
  const response = await apiClient.put(
    `/admin/tasks/${taskId}/column/${columnId}`
  );

  return response.data;
};

// ======================================================
// TASK COLUMN API
// ======================================================

export const getTaskColumns = async () => {
  const response = await apiClient.get(
    "/admin/task-columns"
  );

  return response.data;
};

// Existing alternate name
export const getColumns = getTaskColumns;

export const createColumn = async (
  columnData
) => {
  const response = await apiClient.post(
    "/admin/task-columns",
    columnData
  );

  return response.data;
};

export const updateColumn = async (
  columnId,
  columnData
) => {
  const response = await apiClient.put(
    `/admin/task-columns/${columnId}`,
    columnData
  );

  return response.data;
};

export const deleteColumn = async (
  columnId
) => {
  const response = await apiClient.delete(
    `/admin/task-columns/${columnId}`
  );

  return response.data;
};

// ======================================================
// USERS
// ======================================================

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

// ======================================================
// CHAT
// ======================================================

export const getChats = async () => {
  const response = await apiClient.get(
    "/chat"
  );

  return response.data;
};

export const sendMessage = async (
  messageData
) => {
  const response = await apiClient.post(
    "/chat",
    messageData
  );

  return response.data;
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default apiClient;