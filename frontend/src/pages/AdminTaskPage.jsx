import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  Refresh,
  Assignment,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjects,
  getSprints,
  getUsers,
  getColumns,
} from "../services/api";

const emptyTask = {
  id: null,
  title: "",
  description: "",
  priority: "MEDIUM",
  projectId: "",
  sprintId: "",
  assigneeId: "",
  columnId: "",
  dueDate: "",
};

export default function AdminTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState(emptyTask);

  const [filterProject, setFilterProject] = useState("");
  const [filterSprint, setFilterSprint] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tasksResponse,
        projectsResponse,
        usersResponse,
        columnsResponse,
      ] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers(),
        getColumns(),
      ]);

      setTasks(normalizeResponse(tasksResponse));
      setProjects(normalizeResponse(projectsResponse));
      setUsers(normalizeResponse(usersResponse));
      setColumns(normalizeResponse(columnsResponse));
    } catch (err) {
      console.error("Failed to load admin task data:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load task information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // NORMALIZE API RESPONSE
  // =========================================================

  const normalizeResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    return [];
  };

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditingTask(null);

    setForm({
      ...emptyTask,
      projectId: filterProject || "",
      sprintId: filterSprint || "",
    });

    setDialogOpen(true);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);

    setForm({
      id: task.id,
      title: task.title || task.name || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      projectId:
        task.project?.id ||
        task.projectId ||
        "",
      sprintId:
        task.sprint?.id ||
        task.sprintId ||
        "",
      assigneeId:
        task.assignee?.id ||
        task.assigneeId ||
        "",
      columnId:
        task.column?.id ||
        task.columnId ||
        task.taskColumn?.id ||
        "",
      dueDate: task.dueDate || "",
    });

    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingTask(null);
    setForm(emptyTask);
  };

  // =========================================================
  // SAVE TASK
  // =========================================================

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!form.projectId) {
      setError("Please select a project.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        projectId: Number(form.projectId),
        sprintId: form.sprintId
          ? Number(form.sprintId)
          : null,
        assigneeId: form.assigneeId
          ? Number(form.assigneeId)
          : null,
        columnId: form.columnId
          ? Number(form.columnId)
          : null,
        dueDate: form.dueDate || null,
      };

      if (editingTask?.id) {
        await updateTask(editingTask.id, payload);
        setSuccess("Task updated successfully.");
      } else {
        await createTask(payload);
        setSuccess("Task created successfully.");
      }

      closeDialog();
      await loadTasksOnly();
    } catch (err) {
      console.error("Task save error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasksOnly = async () => {
    try {
      const response = await getTasks();
      setTasks(normalizeResponse(response));
    } catch (err) {
      console.error("Failed to reload tasks:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to refresh tasks."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const openDeleteDialog = (task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedTask(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedTask?.id) return;

    try {
      setSaving(true);
      setError("");

      await deleteTask(selectedTask.id);

      setSuccess("Task deleted successfully.");

      closeDeleteDialog();

      await loadTasksOnly();
    } catch (err) {
      console.error("Delete task error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILTERS
  // =========================================================

  const filteredTasks = tasks.filter((task) => {
    const taskProjectId =
      task.project?.id ||
      task.projectId ||
      "";

    const taskSprintId =
      task.sprint?.id ||
      task.sprintId ||
      "";

    const taskPriority =
      task.priority ||
      "";

    const projectMatch =
      !filterProject ||
      String(taskProjectId) === String(filterProject);

    const sprintMatch =
      !filterSprint ||
      String(taskSprintId) === String(filterSprint);

    const priorityMatch =
      !filterPriority ||
      taskPriority === filterPriority;

    return (
      projectMatch &&
      sprintMatch &&
      priorityMatch
    );
  });

  const filteredSprints = filterProject
    ? sprints.filter(
        (sprint) =>
          String(
            sprint.project?.id ||
              sprint.projectId ||
              ""
          ) === String(filterProject)
      )
    : sprints;

  // =========================================================
  // HELPERS
  // =========================================================

  const getProjectName = (task) => {
    if (task.project?.name) {
      return task.project.name;
    }

    const project = projects.find(
      (item) =>
        String(item.id) ===
        String(task.projectId)
    );

    return project?.name || "No Project";
  };

  const getSprintName = (task) => {
    if (task.sprint?.name) {
      return task.sprint.name;
    }

    const sprint = sprints.find(
      (item) =>
        String(item.id) ===
        String(task.sprintId)
    );

    return sprint?.name || "No Sprint";
  };

  const getAssigneeName = (task) => {
    if (task.assignee) {
      return (
        task.assignee.fullName ||
        task.assignee.username ||
        task.assignee.email ||
        "Unassigned"
      );
    }

    const user = users.find(
      (item) =>
        String(item.id) ===
        String(task.assigneeId)
    );

    return (
      user?.fullName ||
      user?.username ||
      "Unassigned"
    );
  };

  const getColumnName = (task) => {
    if (task.column?.name) {
      return task.column.name;
    }

    if (task.taskColumn?.name) {
      return task.taskColumn.name;
    }

    const column = columns.find(
      (item) =>
        String(item.id) ===
        String(
          task.columnId ||
            task.taskColumnId
        )
    );

    return column?.name || "Backlog";
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "CRITICAL":
        return "error";

      case "MEDIUM":
        return "warning";

      case "LOW":
        return "success";

      default:
        return "default";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box>
      <PageHeader
        title="Task Management"
        subtitle="Create, update and manage project tasks"
      />

      {/* ACTION BAR */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
              >
                <InputLabel>
                  Project
                </InputLabel>

                <Select
                  value={filterProject}
                  label="Project"
                  onChange={(e) => {
                    setFilterProject(e.target.value);
                    setFilterSprint("");
                  }}
                >
                  <MenuItem value="">
                    All Projects
                  </MenuItem>

                  {projects.map((project) => (
                    <MenuItem
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
              >
                <InputLabel>
                  Sprint
                </InputLabel>

                <Select
                  value={filterSprint}
                  label="Sprint"
                  onChange={(e) =>
                    setFilterSprint(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All Sprints
                  </MenuItem>

                  {filteredSprints.map((sprint) => (
                    <MenuItem
                      key={sprint.id}
                      value={sprint.id}
                    >
                      {sprint.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 150 }}
              >
                <InputLabel>
                  Priority
                </InputLabel>

                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) =>
                    setFilterPriority(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All Priorities
                  </MenuItem>

                  <MenuItem value="LOW">
                    Low
                  </MenuItem>

                  <MenuItem value="MEDIUM">
                    Medium
                  </MenuItem>

                  <MenuItem value="HIGH">
                    High
                  </MenuItem>

                  <MenuItem value="CRITICAL">
                    Critical
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
            >
              <Tooltip title="Refresh">
                <IconButton
                  onClick={loadAllData}
                  disabled={loading}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
              >
                Add Task
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ERROR */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* TASK LIST */}
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Tasks
            </Typography>

            <Chip
              icon={<Assignment />}
              label={`${filteredTasks.length} Tasks`}
              variant="outlined"
            />
          </Stack>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 8,
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <Assignment
                sx={{
                  fontSize: 50,
                  opacity: 0.4,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                color="text.secondary"
              >
                No tasks found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Create a task to get started.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
              >
                Create Task
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredTasks.map((task) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={task.id}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              wordBreak: "break-word",
                            }}
                          >
                            {task.title ||
                              task.name ||
                              "Untitled Task"}
                          </Typography>

                          {task.taskKey && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {task.taskKey}
                            </Typography>
                          )}
                        </Box>

                        <Stack direction="row">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditDialog(task)
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                openDeleteDialog(task)
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          mb: 2,
                          minHeight: 40,
                        }}
                      >
                        {task.description ||
                          "No description provided."}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 2 }}
                      >
                        <Chip
                          size="small"
                          label={
                            task.priority ||
                            "MEDIUM"
                          }
                          color={priorityColor(
                            task.priority
                          )}
                        />

                        <Chip
                          size="small"
                          label={getColumnName(task)}
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        <strong>Project:</strong>{" "}
                        {getProjectName(task)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        <strong>Sprint:</strong>{" "}
                        {getSprintName(task)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        <strong>Assignee:</strong>{" "}
                        {getAssigneeName(task)}
                      </Typography>

                      {task.dueDate && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          <strong>Due:</strong>{" "}
                          {task.dueDate}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          CREATE / EDIT DIALOG
      ===================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingTask
            ? "Edit Task"
            : "Create Task"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid
            container
            spacing={2}
            sx={{ mt: 0 }}
          >
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Project
                </InputLabel>

                <Select
                  name="projectId"
                  value={form.projectId}
                  label="Project"
                  onChange={(e) => {
                    setForm((previous) => ({
                      ...previous,
                      projectId: e.target.value,
                      sprintId: "",
                    }));
                  }}
                >
                  <MenuItem value="">
                    Select Project
                  </MenuItem>

                  {projects.map((project) => (
                    <MenuItem
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Sprint
                </InputLabel>

                <Select
                  name="sprintId"
                  value={form.sprintId}
                  label="Sprint"
                  onChange={handleChange}
                  disabled={!form.projectId}
                >
                  <MenuItem value="">
                    No Sprint
                  </MenuItem>

                  {sprints
                    .filter(
                      (sprint) =>
                        !form.projectId ||
                        String(
                          sprint.project?.id ||
                            sprint.projectId ||
                            ""
                        ) ===
                          String(form.projectId)
                    )
                    .map((sprint) => (
                      <MenuItem
                        key={sprint.id}
                        value={sprint.id}
                      >
                        {sprint.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Priority
                </InputLabel>

                <Select
                  name="priority"
                  value={form.priority}
                  label="Priority"
                  onChange={handleChange}
                >
                  <MenuItem value="LOW">
                    Low
                  </MenuItem>

                  <MenuItem value="MEDIUM">
                    Medium
                  </MenuItem>

                  <MenuItem value="HIGH">
                    High
                  </MenuItem>

                  <MenuItem value="CRITICAL">
                    Critical
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Assignee
                </InputLabel>

                <Select
                  name="assigneeId"
                  value={form.assigneeId}
                  label="Assignee"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    Unassigned
                  </MenuItem>

                  {users.map((user) => (
                    <MenuItem
                      key={user.id}
                      value={user.id}
                    >
                      {user.fullName ||
                        user.username ||
                        user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Column
                </InputLabel>

                <Select
                  name="columnId"
                  value={form.columnId}
                  label="Column"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    Backlog
                  </MenuItem>

                  {columns.map((column) => (
                    <MenuItem
                      key={column.id}
                      value={column.id}
                    >
                      {column.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingTask
              ? "Update Task"
              : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          DELETE DIALOG
      ===================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Task
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {selectedTask?.title ||
                selectedTask?.name ||
                "this task"}
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={saving}
          >
            {saving
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}