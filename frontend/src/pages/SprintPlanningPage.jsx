import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import {
  getSprintById,
  getSprintTasks,
  getTaskColumns,
  createTask,
  updateTask,
  deleteTask,
} from "../api";

export default function SprintPlanningPage() {
  const { id } = useParams();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    columnStateId: "",
    assigneeId: "",
  });

  // --------------------------------------------------
  // COMMON ERROR HANDLER
  // --------------------------------------------------

  const getErrorMessage = (err, fallbackMessage) => {
    const responseData = err?.response?.data;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (err?.message) {
      return err.message;
    }

    return fallbackMessage;
  };

  // --------------------------------------------------
  // NORMALIZE API RESPONSE
  // --------------------------------------------------

  const getResponseData = (response) => {
    if (response?.data !== undefined) {
      return response.data;
    }

    return response;
  };

  // --------------------------------------------------
  // LOAD SPRINT PLANNING DATA
  // --------------------------------------------------

  const loadPlanningData = async () => {
    if (!id) {
      setError("Sprint ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("=================================");
      console.log("LOADING SPRINT PLANNING");
      console.log("SPRINT ID:", id);
      console.log("=================================");

      // ----------------------------------------------
      // LOAD SPRINT
      // ----------------------------------------------

      const sprintResponse = await getSprintById(id);
      const sprintData = getResponseData(sprintResponse);

      if (!sprintData) {
        throw new Error("Sprint not found.");
      }

      setSprint(sprintData);

      // ----------------------------------------------
      // LOAD TASKS + COLUMNS
      // ----------------------------------------------

      const [taskResponse, columnResponse] =
        await Promise.all([
          getSprintTasks(id),
          getTaskColumns(),
        ]);

      const taskData = getResponseData(taskResponse);
      const columnData = getResponseData(columnResponse);

      // ----------------------------------------------
      // NORMALIZE TASKS
      // ----------------------------------------------

      const sprintTasks = Array.isArray(taskData)
        ? taskData
        : Array.isArray(taskData?.content)
        ? taskData.content
        : Array.isArray(taskData?.tasks)
        ? taskData.tasks
        : [];

      // ----------------------------------------------
      // NORMALIZE COLUMNS
      // ----------------------------------------------

      const taskColumns = Array.isArray(columnData)
        ? [...columnData].sort(
            (a, b) =>
              Number(a?.position ?? 0) -
              Number(b?.position ?? 0)
          )
        : Array.isArray(columnData?.content)
        ? [...columnData.content].sort(
            (a, b) =>
              Number(a?.position ?? 0) -
              Number(b?.position ?? 0)
          )
        : Array.isArray(columnData?.columns)
        ? [...columnData.columns].sort(
            (a, b) =>
              Number(a?.position ?? 0) -
              Number(b?.position ?? 0)
          )
        : [];

      setTasks(sprintTasks);
      setColumns(taskColumns);

      console.log("SPRINT:", sprintData);
      console.log("SPRINT TASKS:", sprintTasks);
      console.log("TASK COLUMNS:", taskColumns);
    } catch (err) {
      console.error(
        "FAILED TO LOAD SPRINT PLANNING:",
        err
      );

      console.error(
        "HTTP STATUS:",
        err?.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Could not load sprint planning."
        )
      );

      setSprint(null);
      setTasks([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadPlanningData();
  }, [id]);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // --------------------------------------------------
  // FIND DEFAULT TODO COLUMN
  // --------------------------------------------------

  const getDefaultColumn = () => {
    if (!columns.length) {
      return null;
    }

    const todoColumn = columns.find((column) => {
      const name = String(
        column?.name || ""
      )
        .trim()
        .toUpperCase();

      return [
        "TO DO",
        "TODO",
        "TO-DO",
        "PLANNING",
        "BACKLOG",
      ].includes(name);
    });

    return todoColumn || columns[0];
  };

  // --------------------------------------------------
  // OPEN ADD TASK
  // --------------------------------------------------

  const handleAddTask = () => {
    setEditingTask(null);

    const defaultColumn = getDefaultColumn();

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      columnStateId: defaultColumn
        ? String(defaultColumn.id)
        : "",
      assigneeId: "",
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  // --------------------------------------------------
  // GET TASK COLUMN ID
  // --------------------------------------------------

  const getTaskColumnId = (task) => {
    if (task?.columnState?.id != null) {
      return String(task.columnState.id);
    }

    if (task?.column?.id != null) {
      return String(task.column.id);
    }

    if (task?.columnId != null) {
      return String(task.columnId);
    }

    if (task?.columnStateId != null) {
      return String(task.columnStateId);
    }

    return "";
  };

  // --------------------------------------------------
  // GET TASK ASSIGNEE ID
  // --------------------------------------------------

  const getTaskAssigneeId = (task) => {
    if (task?.assignee?.id != null) {
      return String(task.assignee.id);
    }

    if (task?.assigneeId != null) {
      return String(task.assigneeId);
    }

    return "";
  };

  // --------------------------------------------------
  // OPEN EDIT TASK
  // --------------------------------------------------

  const handleEditTask = (task) => {
    setEditingTask(task);

    setForm({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "MEDIUM",
      columnStateId: getTaskColumnId(task),
      assigneeId: getTaskAssigneeId(task),
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  // --------------------------------------------------
  // CLOSE DIALOG
  // --------------------------------------------------

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      columnStateId: "",
      assigneeId: "",
    });
  };

  // --------------------------------------------------
  // VALIDATE FORM
  // --------------------------------------------------

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Task title is required.";
    }

    if (!sprint) {
      return "Sprint information is not available.";
    }

    if (!id) {
      return "Sprint ID is missing.";
    }

    const projectId =
      sprint?.project?.id ??
      sprint?.projectId;

    if (
      projectId === undefined ||
      projectId === null ||
      Number.isNaN(Number(projectId))
    ) {
      return "Project ID is missing from the sprint.";
    }

    return "";
  };

  // --------------------------------------------------
  // SAVE TASK
  // --------------------------------------------------

  const handleSaveTask = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const projectId =
        sprint?.project?.id ??
        sprint?.projectId;

      const taskData = {
        title: form.title.trim(),

        description:
          form.description?.trim() || "",

        priority:
          form.priority || "MEDIUM",

        status:
          editingTask?.status || "TODO",

        projectId: Number(projectId),

        sprintId: Number(id),

        assigneeId:
          form.assigneeId &&
          String(form.assigneeId).trim() !== ""
            ? Number(form.assigneeId)
            : null,

        columnId:
          form.columnStateId &&
          String(form.columnStateId).trim() !== ""
            ? Number(form.columnStateId)
            : null,
      };

      console.log(
        "================================="
      );
      console.log(
        editingTask
          ? "UPDATING TASK"
          : "CREATING TASK"
      );
      console.log("TASK PAYLOAD:", taskData);
      console.log(
        "================================="
      );

      // ----------------------------------------------
      // UPDATE
      // ----------------------------------------------

      if (editingTask) {
        await updateTask(
          editingTask.id,
          taskData
        );

        setSuccess(
          "Task updated successfully."
        );
      }

      // ----------------------------------------------
      // CREATE
      // ----------------------------------------------

      else {
        await createTask(taskData);

        setSuccess(
          "Task created successfully."
        );
      }

      setDialogOpen(false);
      setEditingTask(null);

      setForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        columnStateId: "",
        assigneeId: "",
      });

      await loadPlanningData();
    } catch (err) {
      console.error(
        "FAILED TO SAVE TASK:",
        err
      );

      console.error(
        "HTTP STATUS:",
        err?.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Could not save task."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------

  const handleDeleteTask = async (task) => {
    if (!task?.id) {
      setError("Task ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete task "${
        task.title || "Untitled Task"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      console.log(
        "DELETING TASK:",
        task.id
      );

      await deleteTask(task.id);

      setSuccess(
        "Task deleted successfully."
      );

      await loadPlanningData();
    } catch (err) {
      console.error(
        "FAILED TO DELETE TASK:",
        err
      );

      console.error(
        "HTTP STATUS:",
        err?.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        err?.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Could not delete task."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // GET COLUMN NAME
  // --------------------------------------------------

  const getColumnName = (task) => {
    return (
      task?.columnState?.name ||
      task?.column?.name ||
      task?.columnName ||
      "Not assigned"
    );
  };

  // --------------------------------------------------
  // GET ASSIGNEE NAME
  // --------------------------------------------------

  const getAssigneeName = (task) => {
    return (
      task?.assignee?.fullName ||
      task?.assignee?.name ||
      task?.assignee?.username ||
      task?.assignee?.email ||
      "Unassigned"
    );
  };

  // --------------------------------------------------
  // GET PRIORITY LABEL
  // --------------------------------------------------

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "MEDIUM";
    }

    return String(priority).toUpperCase();
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="Sprint Planning"
          subtitle="Plan and organize work for this sprint."
        />

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
          >
            <CircularProgress />

            <Typography color="text.secondary">
              Loading sprint planning...
            </Typography>
          </Stack>
        </Box>
      </Stack>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <Stack spacing={3}>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <PageHeader
        title={
          sprint?.name
            ? `Sprint Planning - ${sprint.name}`
            : "Sprint Planning"
        }
        subtitle={
          sprint?.goal ||
          "Plan and organize work for this sprint."
        }
      />

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ==================================================
          SPRINT INFORMATION
      ================================================== */}

      {sprint && (
        <Card>
          <CardContent>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  {sprint.name}
                </Typography>

                {sprint.goal && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {sprint.goal}
                  </Typography>
                )}

                {sprint.project?.name && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Project: {sprint.project.name}
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                {sprint.status && (
                  <Chip
                    label={sprint.status}
                    size="small"
                  />
                )}

                <Chip
                  label={`${tasks.length} Tasks`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ==================================================
          ACTION BUTTONS
      ================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddTask}
          disabled={!sprint || saving}
        >
          Add Task
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadPlanningData}
          disabled={loading || saving}
        >
          Refresh
        </Button>
      </Stack>

      {/* ==================================================
          NO TASKS
      ================================================== */}

      {tasks.length === 0 && (
        <Alert severity="info">
          No tasks have been added to this
          sprint yet. Click "Add Task" to create
          the first task.
        </Alert>
      )}

      {/* ==================================================
          TASK LIST
      ================================================== */}

      {tasks.length > 0 && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mb: 2 }}
            >
              Sprint Backlog
            </Typography>

            <Stack spacing={1.5}>
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  variant="outlined"
                >
                  <CardContent>
                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      justifyContent="space-between"
                    >

                      {/* --------------------------------
                          TASK INFORMATION
                      -------------------------------- */}

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {task.taskKey ||
                            task.key ||
                            `TASK-${task.id}`}
                        </Typography>

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

                        {task.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                      </Box>

                      {/* --------------------------------
                          TASK DETAILS
                      -------------------------------- */}

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        alignItems="center"
                      >
                        <Chip
                          size="small"
                          label={getPriorityLabel(
                            task.priority
                          )}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={getColumnName(
                            task
                          )}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={getAssigneeName(
                            task
                          )}
                        />
                      </Stack>

                      {/* --------------------------------
                          TASK ACTIONS
                      -------------------------------- */}

                      <Stack
                        direction={{
                          xs: "row",
                          md: "column",
                        }}
                        spacing={1}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() =>
                            handleEditTask(
                              task
                            )
                          }
                          disabled={
                            saving ||
                            deleting
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<Delete />}
                          onClick={() =>
                            handleDeleteTask(
                              task
                            )
                          }
                          disabled={
                            saving ||
                            deleting
                          }
                        >
                          {deleting
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ==================================================
          ADD / EDIT TASK DIALOG
      ================================================== */}

      {dialogOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "rgba(0, 0, 0, 0.45)",
            p: 2,
          }}
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseDialog();
            }
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <CardContent>

              {/* --------------------------------
                  DIALOG TITLE
              -------------------------------- */}

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ mb: 2 }}
              >
                {editingTask
                  ? "Edit Task"
                  : "Add Task"}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>

                {/* --------------------------------
                    TASK TITLE
                -------------------------------- */}

                <TextField
                  fullWidth
                  label="Task Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  autoFocus
                  disabled={saving}
                  placeholder="Enter task title"
                />

                {/* --------------------------------
                    DESCRIPTION
                -------------------------------- */}

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter task description"
                />

                {/* --------------------------------
                    PRIORITY
                -------------------------------- */}

                <FormControl
                  fullWidth
                  disabled={saving}
                >
                  <InputLabel>
                    Priority
                  </InputLabel>

                  <Select
                    label="Priority"
                    name="priority"
                    value={
                      form.priority || "MEDIUM"
                    }
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

                {/* --------------------------------
                    SCRUM COLUMN
                -------------------------------- */}

                <FormControl
                  fullWidth
                  disabled={
                    saving ||
                    columns.length === 0
                  }
                >
                  <InputLabel>
                    Scrum Column
                  </InputLabel>

                  <Select
                    label="Scrum Column"
                    name="columnStateId"
                    value={
                      form.columnStateId || ""
                    }
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      Not assigned
                    </MenuItem>

                    {columns.map((column) => (
                      <MenuItem
                        key={column.id}
                        value={String(
                          column.id
                        )}
                      >
                        {column.name ||
                          `Column ${column.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {columns.length === 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    No Scrum columns are
                    available.
                  </Typography>
                )}

                {/* --------------------------------
                    ASSIGNEE
                -------------------------------- */}

                <TextField
                  fullWidth
                  label="Assignee ID"
                  name="assigneeId"
                  type="number"
                  value={form.assigneeId}
                  onChange={handleChange}
                  disabled={saving}
                  inputProps={{
                    min: 1,
                  }}
                  helperText="Enter the user ID, or leave empty for Unassigned."
                />

                {/* --------------------------------
                    BUTTONS
                -------------------------------- */}

                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ pt: 1 }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCloseDialog}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSaveTask}
                    disabled={
                      saving ||
                      !form.title.trim()
                    }
                  >
                    {saving ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />

                        <span>
                          Saving...
                        </span>
                      </Stack>
                    ) : editingTask ? (
                      "Update Task"
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
    </Stack>
  );
}
