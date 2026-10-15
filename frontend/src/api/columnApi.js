import axiosClient from "./axiosClientApi";

// Get all columns for a project
export const getColumns = async (projectId) => {
  const endpoint = projectId
    ? `/admin/task-columns/project/${projectId}`
    : "/admin/task-columns";
  const response = await axiosClient.get(endpoint);

  return response.data;
};

// Get a single column
export const getColumnById = async (id) => {
  const response = await axiosClient.get(`/admin/task-columns/${id}`);

  return response.data;
};

// Create a new column
export const createColumn = async (columnData) => {
  const response = await axiosClient.post(
    "/admin/task-columns",
    columnData
  );

  return response.data;
};

// Update an existing column
export const updateColumn = async (id, columnData) => {
  const response = await axiosClient.put(
    `/admin/task-columns/${id}`,
    columnData
  );

  return response.data;
};

// Delete a column
export const deleteColumn = async (id) => {
  const response = await axiosClient.delete(
    `/admin/task-columns/${id}`
  );

  return response.data;
};

// Reorder columns
export const reorderColumns = async (columns) => {
  const response = await axiosClient.put(
    "/admin/task-columns/reorder",
    columns
  );

  return response.data;
};
