import apiClient from "../api/apiClient";

// =========================================================
// TASK COLUMN SERVICES
// =========================================================

export const getTaskColumns = async () => {
  const response = await apiClient.get(
    "/admin/task-columns"
  );

  return response.data;
};

export const getColumns =
  getTaskColumns;

export const getColumnsByProject = async (
  projectId
) => {
  const response = await apiClient.get(
    `/admin/task-columns/project/${projectId}`
  );

  return response.data;
};

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