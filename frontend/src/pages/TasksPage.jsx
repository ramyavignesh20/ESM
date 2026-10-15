import React, { useEffect, useMemo, useState } from "react";

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
  Typography,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  Refresh,
} from "@mui/icons-material";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";

import { getProjects } from "../api/projectApi";
import { getSprints } from "../api/sprintApi";
import { getUsers } from "../api/userApi";

/* =========================================================
   INITIAL FORM
========================================================= */

const initialForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  projectId: "",
  sprintId: "",
  assigneeId: "",
};

/* =========================================================
   HELPER
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* =======================================================
     SNACKBAR
  ======================================================= */

  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }));
  };

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        tasksResponse,
        projectsResponse,
        sprintsResponse,
        usersResponse,
      ] = await Promise.all([
        getTasks(),
        getProjects(),
        getSprints(),
        getUsers(),
      ]);

      setTasks(normalizeResponse(tasksResponse));
      setProjects(normalizeResponse(projectsResponse));
      setSprints(normalizeResponse(sprintsResponse));
      setUsers(normalizeResponse(usersResponse));
    } catch (error) {
      console.error("Error loading task data:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to load task data.";

      showMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
     * If project changes, clear the selected sprint.
     * This prevents selecting a sprint belonging to another project.
     */
    if (name === "projectId") {
      setForm((previous) => ({
        ...previous,
        projectId: value,
        sprintId: "",
      }));
    }
  };

  /* =======================================================
     AVAILABLE SPRINTS
  ======================================================= */

  const availableSprints = useMemo(() => {
    if (!form.projectId) {
      return sprints;
    }

    return sprints.filter((sprint) => {
      const sprintProjectId =
        sprint?.project?.id ??
        sprint?.projectId ??
        sprint?.projectID;

      return Number(sprintProjectId) === Number(form.projectId);
    });
  }, [sprints, form.projectId]);

  /* =======================================================
     ADD TASK
  ======================================================= */

  const handleAddTask = () => {
    setEditingTask(null);
    setForm({ ...initialForm });
    setOpenDialog(true);
  };

  /* =======================================================
     EDIT TASK
  ======================================================= */

  const handleEditTask = (task) => {
    setEditingTask(task);

    const projectId =
      task?.project?.id ??
      task?.projectId ??
      "";

    const sprintId =
      task?.sprint?.id ??
      task?.sprintId ??
      "";

    const assigneeId =
      task?.assignee?.id ??
      task?.assigneeId ??
      "";

    setForm({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "MEDIUM",
      status: task?.status || "TODO",

      dueDate: task?.dueDate
        ? String(task.dueDate).substring(0, 10)
        : "",

      projectId,
      sprintId,
      assigneeId,
    });

    setOpenDialog(true);
  };

  /* =======================================================
     CLOSE DIALOG
  ======================================================= */

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);
    setEditingTask(null);
    setForm({ ...initialForm });
  };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm = () => {
    if (!form.title.trim()) {
      showMessage("Task title is required.", "warning");
      return false;
    }

    if (!form.projectId) {
      showMessage("Please select a project.", "warning");
      return false;
    }

    return true;
  };

  /* =======================================================
     CREATE / UPDATE TASK
  ======================================================= */

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      title: form.title.trim(),

      description: form.description.trim(),

      priority: form.priority,

      status: form.status,

      dueDate: form.dueDate || null,

      projectId: Number(form.projectId),

      sprintId: form.sprintId
        ? Number(form.sprintId)
        : null,

      assigneeId: form.assigneeId
        ? Number(form.assigneeId)
        : null,
    };

    console.log("TASK PAYLOAD:", payload);

    setSaving(true);

    try {
      if (editingTask) {
        await updateTask(
          editingTask.id,
          payload
        );

        showMessage(
          "Task updated successfully."
        );
      } else {
        await createTask(payload);

        showMessage(
          "Task created successfully."
        );
      }

      setOpenDialog(false);
      setEditingTask(null);
      setForm({ ...initialForm });

      await loadData();
    } catch (error) {
      console.error(
        "Error saving task:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        error?.message ||
        "Unable to save task.";

      showMessage(
        typeof message === "string"
          ? message
          : "Unable to save task.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE TASK
  ======================================================= */

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(taskId);

    try {
      await deleteTask(taskId);

      showMessage(
        "Task deleted successfully."
      );

      await loadData();
    } catch (error) {
      console.error(
        "Error deleting task:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to delete task.";

      showMessage(
        message,
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     STATUS COLOR
  ======================================================= */

  const getStatusColor = (status) => {
    switch (status) {
      case "TODO":
        return "default";

      case "IN_PROGRESS":
        return "info";

      case "IN_REVIEW":
        return "warning";

      case "DONE":
        return "success";

      case "BLOCKED":
        return "error";

      default:
        return "default";
    }
  };

  /* =======================================================
     PRIORITY COLOR
  ======================================================= */

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "success";

      case "MEDIUM":
        return "info";

      case "HIGH":
        return "warning";

      case "CRITICAL":
        return "error";

      default:
        return "default";
    }
  };

  /* =======================================================
     PROJECT NAME
  ======================================================= */

  const getProjectName = (task) => {
    if (task?.project?.name) {
      return task.project.name;
    }

    const projectId =
      task?.projectId ??
      task?.project?.id;

    const project = projects.find(
      (item) =>
        Number(item.id) ===
        Number(projectId)
    );

    return (
      project?.name ||
      "No Project"
    );
  };

  /* =======================================================
     SPRINT NAME
  ======================================================= */

  const getSprintName = (task) => {
    if (task?.sprint?.name) {
      return task.sprint.name;
    }

    const sprintId =
      task?.sprintId ??
      task?.sprint?.id;

    if (!sprintId) {
      return "No Sprint";
    }

    const sprint = sprints.find(
      (item) =>
        Number(item.id) ===
        Number(sprintId)
    );

    return (
      sprint?.name ||
      "No Sprint"
    );
  };

  /* =======================================================
     ASSIGNEE NAME
  ======================================================= */

  const getAssigneeName = (task) => {
    if (task?.assignee) {
      return (
        task.assignee.name ||
        task.assignee.username ||
        task.assignee.email ||
        "Assigned"
      );
    }

    const assigneeId =
      task?.assigneeId ??
      task?.assignee?.id;

    if (!assigneeId) {
      return "Unassigned";
    }

    const user = users.find(
      (item) =>
        Number(item.id) ===
        Number(assigneeId)
    );

    return (
      user?.name ||
      user?.username ||
      user?.email ||
      "Unassigned"
    );
  };

  /* =======================================================
     USER DISPLAY NAME
  ======================================================= */

  const getUserDisplayName = (user) => {
    return (
      user?.name ||
      user?.username ||
      user?.email ||
      `User ${user?.id ?? ""}`
    );
  };

  /* =======================================================
     TASK KEY
  ======================================================= */

  const getTaskKey = (task) => {
    return (
      task?.taskKey ||
      task?.key ||
      `TASK-${task?.id ?? ""}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box sx={{ p: 3 }}>

      {/* ===================================================
          HEADER
      =================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Tasks
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Create, update and manage
            project tasks
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress
                  size={18}
                />
              ) : (
                <Refresh />
              )
            }
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTask}
            disabled={loading}
          >
            Add Task
          </Button>
        </Stack>
      </Stack>

      {/* ===================================================
          TASK COUNT
      =================================================== */}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {tasks.length} task
        {tasks.length !== 1 ? "s" : ""}
      </Typography>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ===================================================
          TASK CARDS
      =================================================== */}

      {!loading && (
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={task.id}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  transition: "0.2s",

                  "&:hover": {
                    transform:
                      "translateY(-3px)",
                    boxShadow: 5,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>

                    {/* Task Key */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {getTaskKey(task)}
                    </Typography>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {task.title ||
                        "Untitled Task"}
                    </Typography>

                    {/* Description */}
                    {task.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display:
                            "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient:
                            "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    {/* Status / Priority */}
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        size="small"
                        label={
                          task.status ||
                          "TODO"
                        }
                        color={getStatusColor(
                          task.status
                        )}
                      />

                      <Chip
                        size="small"
                        label={
                          task.priority ||
                          "MEDIUM"
                        }
                        color={getPriorityColor(
                          task.priority
                        )}
                        variant="outlined"
                      />
                    </Stack>

                    {/* Project */}
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Project
                      </Typography>

                      <Typography variant="body2">
                        {getProjectName(
                          task
                        )}
                      </Typography>
                    </Box>

                    {/* Sprint */}
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Sprint
                      </Typography>

                      <Typography variant="body2">
                        {getSprintName(
                          task
                        )}
                      </Typography>
                    </Box>

                    {/* Assignee */}
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Assignee
                      </Typography>

                      <Typography variant="body2">
                        {getAssigneeName(
                          task
                        )}
                      </Typography>
                    </Box>

                    {/* Due Date */}
                    {task.dueDate && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Due Date
                        </Typography>

                        <Typography variant="body2">
                          {String(
                            task.dueDate
                          ).substring(
                            0,
                            10
                          )}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={1}
                      sx={{ pt: 1 }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleEditTask(
                            task
                          )
                        }
                        disabled={
                          deletingId ===
                          task.id
                        }
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteTask(
                            task.id
                          )
                        }
                        disabled={
                          deletingId ===
                          task.id
                        }
                      >
                        {deletingId ===
                        task.id ? (
                          <CircularProgress
                            size={22}
                          />
                        ) : (
                          <Delete />
                        )}
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {tasks.length === 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack
                    alignItems="center"
                    spacing={2}
                    sx={{ py: 6 }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                    >
                      No tasks found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Create your first task
                      to get started.
                    </Typography>

                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={
                        handleAddTask
                      }
                    >
                      Create Task
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* ===================================================
          CREATE / EDIT DIALOG
      =================================================== */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
            sx={{ pt: 1 }}
          >

            {/* Task Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>

            {/* Project */}
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                required
              >
                <InputLabel>
                  Project
                </InputLabel>

                <Select
                  name="projectId"
                  value={
                    form.projectId
                  }
                  label="Project"
                  onChange={handleChange}
                  disabled={saving}
                >
                  {projects.length ===
                  0 ? (
                    <MenuItem disabled>
                      No projects found
                    </MenuItem>
                  ) : (
                    projects.map(
                      (project) => (
                        <MenuItem
                          key={
                            project.id
                          }
                          value={
                            project.id
                          }
                        >
                          {project.name ||
                            project.title ||
                            `Project ${project.id}`}
                        </MenuItem>
                      )
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Sprint */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  Sprint
                </InputLabel>

                <Select
                  name="sprintId"
                  value={
                    form.sprintId
                  }
                  label="Sprint"
                  onChange={handleChange}
                  disabled={saving}
                >
                  <MenuItem value="">
                    No Sprint
                  </MenuItem>

                  {availableSprints.length ===
                  0 ? (
                    <MenuItem disabled>
                      No sprints available
                    </MenuItem>
                  ) : (
                    availableSprints.map(
                      (sprint) => (
                        <MenuItem
                          key={
                            sprint.id
                          }
                          value={
                            sprint.id
                          }
                        >
                          {sprint.name ||
                            sprint.title ||
                            `Sprint ${sprint.id}`}
                        </MenuItem>
                      )
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Priority
                </InputLabel>

                <Select
                  name="priority"
                  value={
                    form.priority
                  }
                  label="Priority"
                  onChange={handleChange}
                  disabled={saving}
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

            {/* Status */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  name="status"
                  value={
                    form.status
                  }
                  label="Status"
                  onChange={handleChange}
                  disabled={saving}
                >
                  <MenuItem value="TODO">
                    To Do
                  </MenuItem>

                  <MenuItem value="IN_PROGRESS">
                    In Progress
                  </MenuItem>

                  <MenuItem value="IN_REVIEW">
                    In Review
                  </MenuItem>

                  <MenuItem value="DONE">
                    Done
                  </MenuItem>

                  <MenuItem value="BLOCKED">
                    Blocked
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Assignee */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Assignee
                </InputLabel>

                <Select
                  name="assigneeId"
                  value={
                    form.assigneeId
                  }
                  label="Assignee"
                  onChange={handleChange}
                  disabled={saving}
                >
                  <MenuItem value="">
                    Unassigned
                  </MenuItem>

                  {users.length === 0 ? (
                    <MenuItem disabled>
                      No users found
                    </MenuItem>
                  ) : (
                    users.map(
                      (user) => (
                        <MenuItem
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {getUserDisplayName(
                            user
                          )}
                        </MenuItem>
                      )
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                name="dueDate"
                value={
                  form.dueDate
                }
                onChange={handleChange}
                disabled={saving}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* =================================================
            DIALOG ACTIONS
        ================================================= */}

        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : null
            }
          >
            {saving
              ? "Saving..."
              : editingTask
              ? "Update Task"
              : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================
          SNACKBAR
      =================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={
            snackbar.severity
          }
          onClose={closeSnackbar}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TasksPage;