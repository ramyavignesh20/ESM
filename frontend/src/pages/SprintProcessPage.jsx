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
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getColumns } from "../api/columnApi";
import { ViewKanban } from "@mui/icons-material";

import {
  getProjects,
  getSprintsByProject,
  getProjectTasks,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../api";

import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";

const emptySprint = {
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  status: "PLANNED",
};

const SprintProcessPage = () => {
  const navigate = useNavigate();
  // =========================================================
  // PROJECT STATE
  // =========================================================

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // =========================================================
  // SPRINT STATE
  // =========================================================

  const [sprints, setSprints] = useState([]);

  // =========================================================
  // TASK STATE
  // =========================================================

  const [tasks, setTasks] = useState([]);
  const [flowColumns, setFlowColumns] = useState([]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // DIALOG STATE
  // =========================================================

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [sprintForm, setSprintForm] = useState(emptySprint);

  // =========================================================
  // DELETE STATE
  // =========================================================

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState(null);

  // =========================================================
  // MESSAGE STATE
  // =========================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);

      console.log("====================================");
      console.log("LOADING PROJECTS");
      console.log("====================================");

      const projectResponse = await getProjects();

      console.log(
        "PROJECT API RESPONSE:",
        projectResponse
      );

      const projectList = Array.isArray(projectResponse)
        ? projectResponse
        : [];

      console.log(
        "PROJECT LIST:",
        projectList
      );

      setProjects(projectList);

      // -------------------------------------------------------
      // AUTO SELECT FIRST PROJECT
      // -------------------------------------------------------

      if (projectList.length > 0) {

        const firstProjectId =
          String(projectList[0].id);

        console.log(
          "AUTO SELECTING PROJECT:",
          firstProjectId
        );

        setSelectedProjectId(firstProjectId);

      } else {

        console.log(
          "NO PROJECTS FOUND"
        );

        setSelectedProjectId("");
      }

    } catch (error) {

      console.error(
        "FAILED TO LOAD PROJECTS:",
        error
      );

      showMessage(
        "Failed to load projects",
        "error"
      );

      setProjects([]);

    } finally {

      setLoadingProjects(false);
    }
  };

  // =========================================================
  // LOAD SPRINTS + TASKS
  // =========================================================

  useEffect(() => {

    if (!selectedProjectId) {
      setSprints([]);
      setTasks([]);
      return;
    }

    loadSprintProcessData(
      selectedProjectId
    );

  }, [selectedProjectId]);

  const loadSprintProcessData = async (
    projectId
  ) => {

    try {

      setLoadingData(true);

      console.log("====================================");
      console.log("LOADING SPRINT PROCESS");
      console.log("PROJECT ID:", projectId);
      console.log("====================================");

      // -------------------------------------------------------
      // LOAD SPRINTS
      // -------------------------------------------------------

      const sprintResponse =
        await getSprintsByProject(projectId);

      console.log(
        "SPRINT API RESPONSE:",
        sprintResponse
      );

      const sprintList =
        Array.isArray(sprintResponse)
          ? sprintResponse
          : [];

      console.log(
        "SPRINT LIST:",
        sprintList
      );

      setSprints(sprintList);

      // -------------------------------------------------------
      // LOAD PROJECT TASKS
      // -------------------------------------------------------

      const [taskResponse, columnResponse] = await Promise.all([
        getProjectTasks(projectId),
        getColumns(projectId),
      ]);

      console.log(
        "TASK API RESPONSE:",
        taskResponse
      );

      const taskList =
        Array.isArray(taskResponse)
          ? taskResponse
          : [];

      console.log(
        "TASK LIST:",
        taskList
      );

      setTasks(taskList);
      setFlowColumns(Array.isArray(columnResponse) ? columnResponse : []);

    } catch (error) {

      console.error(
        "FAILED TO LOAD SPRINT PROCESS DATA:",
        error
      );

      console.error(
        "HTTP STATUS:",
        error.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setSprints([]);
      setTasks([]);
      setFlowColumns([]);

      showMessage(
        "Failed to load sprint process data",
        "error"
      );

    } finally {

      setLoadingData(false);
    }
  };

  // =========================================================
  // SELECT PROJECT
  // =========================================================

  const handleProjectChange = (event) => {

    const value = event.target.value;

    console.log(
      "PROJECT SELECTED:",
      value
    );

    setSelectedProjectId(
      String(value)
    );
  };

  // =========================================================
  // SELECTED PROJECT
  // =========================================================

  const selectedProject =
    projects.find(
      (project) =>
        String(project.id) ===
        String(selectedProjectId)
    );

  // =========================================================
  // OPEN CREATE DIALOG
  // =========================================================

  const handleAddSprint = () => {

    setEditingSprint(null);

    setSprintForm({
      ...emptySprint,
    });

    setOpenDialog(true);
  };

  // =========================================================
  // OPEN EDIT DIALOG
  // =========================================================

  const handleEditSprint = (sprint) => {

    setEditingSprint(sprint);

    setSprintForm({
      name: sprint.name || "",
      goal: sprint.goal || "",
      startDate: sprint.startDate || "",
      endDate: sprint.endDate || "",
      status: sprint.status || "PLANNED",
    });

    setOpenDialog(true);
  };

  // =========================================================
  // CLOSE DIALOG
  // =========================================================

  const handleCloseDialog = () => {

    if (saving) {
      return;
    }

    setOpenDialog(false);
    setEditingSprint(null);

    setSprintForm({
      ...emptySprint,
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setSprintForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE SPRINT
  // =========================================================

  const handleSaveSprint = async () => {

    if (!selectedProjectId) {

      showMessage(
        "Please select a project",
        "error"
      );

      return;
    }

    if (!sprintForm.name.trim()) {

      showMessage(
        "Sprint name is required",
        "error"
      );

      return;
    }

    if (!sprintForm.startDate) {

      showMessage(
        "Start date is required",
        "error"
      );

      return;
    }

    if (!sprintForm.endDate) {

      showMessage(
        "End date is required",
        "error"
      );

      return;
    }

    if (
      sprintForm.endDate <
      sprintForm.startDate
    ) {

      showMessage(
        "End date cannot be before start date",
        "error"
      );

      return;
    }

    try {

      setSaving(true);

      const sprintData = {
        name: sprintForm.name.trim(),
        goal: sprintForm.goal?.trim() || "",
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        status: sprintForm.status || "PLANNED",
        projectId: Number(selectedProjectId),
      };

      console.log(
        "SAVING SPRINT:",
        sprintData
      );

      // -------------------------------------------------------
      // CREATE
      // -------------------------------------------------------

      if (!editingSprint) {

        await createSprint(
          sprintData
        );

        showMessage(
          "Sprint created successfully",
          "success"
        );

      }

      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      else {

        await updateSprint(
          editingSprint.id,
          sprintData
        );

        showMessage(
          "Sprint updated successfully",
          "success"
        );
      }

      setOpenDialog(false);

      setEditingSprint(null);

      setSprintForm({
        ...emptySprint,
      });

      await loadSprintProcessData(
        selectedProjectId
      );

    } catch (error) {

      console.error(
        "FAILED TO SAVE SPRINT:",
        error
      );

      console.error(
        "HTTP STATUS:",
        error.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      showMessage(
        error.response?.data ||
          "Failed to save sprint",
        "error"
      );

    } finally {

      setSaving(false);
    }
  };

  // =========================================================
  // DELETE CONFIRMATION
  // =========================================================

  const handleDeleteClick = (sprint) => {

    setSprintToDelete(sprint);

    setDeleteDialogOpen(true);
  };

  // =========================================================
  // DELETE SPRINT
  // =========================================================

  const handleDeleteSprint = async () => {

    if (!sprintToDelete) {
      return;
    }

    try {

      await deleteSprint(
        sprintToDelete.id
      );

      showMessage(
        "Sprint deleted successfully",
        "success"
      );

      setDeleteDialogOpen(false);
      setSprintToDelete(null);

      await loadSprintProcessData(
        selectedProjectId
      );

    } catch (error) {

      console.error(
        "FAILED TO DELETE SPRINT:",
        error
      );

      console.error(
        "HTTP STATUS:",
        error.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      showMessage(
        error.response?.data ||
          "Failed to delete sprint",
        "error"
      );
    }
  };

  // =========================================================
  // SNACKBAR
  // =========================================================

  const showMessage = (
    text,
    type = "success"
  ) => {

    setMessage(text);
    setMessageType(type);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // =========================================================
  // TASK COUNT
  // =========================================================

  const getTaskCountForSprint = (
    sprintId
  ) => {

    return tasks.filter(
      (task) =>
        task.sprint &&
        String(task.sprint.id) ===
          String(sprintId)
    ).length;
  };

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusColor = (status) => {

    switch (
      String(status || "").toUpperCase()
    ) {

      case "ACTIVE":
        return "success";

      case "COMPLETED":
        return "info";

      case "CANCELLED":
        return "error";

      case "PLANNED":
      default:
        return "warning";
    }
  };

  const completedTasks = tasks.filter((task) =>
    ["DONE", "COMPLETED", "COMPLETE", "CLOSED"].includes(
      String(task.status || "").toUpperCase()
    )
  ).length;
  const inProgressTasks = tasks.filter((task) =>
    ["IN_PROGRESS", "INPROGRESS", "PROGRESS", "DOING"].includes(
      String(task.status || "").toUpperCase()
    )
  ).length;
  const todoTasks = Math.max(
    tasks.length - completedTasks - inProgressTasks,
    0
  );
  const reportTotal = Math.max(tasks.length, 1);
  const flowData = flowColumns
    .slice()
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((column) => ({
      name: column.name,
      count: tasks.filter((task) => String(
        task.columnState?.id ?? task.columnStateId ?? task.column?.id
      ) === String(column.id)).length,
    }));
  const maxFlowCount = Math.max(...flowData.map((item) => item.count), 1);

  // =========================================================
  // LOADING PROJECTS
  // =========================================================

  if (loadingProjects) {

    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>

      <PageHeader
        title="Sprint Process"
        subtitle="Manage project sprints and track sprint tasks"
      />

      {/* =====================================================
          PROJECT SELECTOR
      ===================================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >

        <CardContent>

          <Grid
            container
            spacing={2}
            alignItems="center"
          >

            <Grid
              item
              xs={12}
              md={8}
            >

              <FormControl
                fullWidth
              >

                <InputLabel>
                  Select Project
                </InputLabel>

                <Select
                  value={
                    selectedProjectId
                  }
                  label="Select Project"
                  onChange={
                    handleProjectChange
                  }
                >

                  {projects.map(
                    (project) => (

                      <MenuItem
                        key={project.id}
                        value={
                          String(project.id)
                        }
                      >

                        {project.name}

                        {project.projectKey
                          ? ` (${project.projectKey})`
                          : ""}

                      </MenuItem>

                    )
                  )}

                </Select>

              </FormControl>

            </Grid>

            <Grid
              item
              xs={12}
              md={4}
            >

              <Button
                fullWidth
                variant="contained"
                onClick={handleAddSprint}
                disabled={
                  !selectedProjectId
                }
              >
                Add Sprint
              </Button>

            </Grid>

          </Grid>

        </CardContent>

      </Card>

      {/* =====================================================
          PROJECT INFORMATION
      ===================================================== */}

      {selectedProject && (

        <Card
          sx={{
            mb: 3,
          }}
        >

          <CardContent>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              justifyContent="space-between"
            >

              <Box>

                <Typography
                  variant="h6"
                  fontWeight={600}
                >
                  {selectedProject.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Project Key:{" "}
                  {selectedProject.projectKey ||
                    "-"}
                </Typography>

              </Box>

              <Chip
                label={
                  selectedProject.status ||
                  "ACTIVE"
                }
                color={
                  String(
                    selectedProject.status ||
                      "ACTIVE"
                  ).toUpperCase() ===
                  "ACTIVE"
                    ? "success"
                    : "default"
                }
              />

            </Stack>

          </CardContent>

        </Card>

      )}

      {/* =====================================================
          DATA LOADING
      ===================================================== */}

      {loadingData ? (

        <Box
          sx={{
            minHeight: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <CircularProgress />

        </Box>

      ) : (

        <>
          {/* =================================================
              SUMMARY
          ================================================= */}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >

              <Card>

                <CardContent>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Sprints
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {sprints.length}
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >

              <Card>

                <CardContent>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Project Tasks
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {tasks.length}
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >

              <Card>

                <CardContent>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Active Sprints
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {
                      sprints.filter(
                        (sprint) =>
                          String(
                            sprint.status ||
                              ""
                          ).toUpperCase() ===
                          "ACTIVE"
                      ).length
                    }
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

          </Grid>

          {/* =================================================
              PROCESS REPORT
          ================================================= */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Sprint Process Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current task distribution for the selected project.
                  </Typography>
                </Box>
                <Chip
                  label={`${tasks.length} total tasks`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Stack spacing={2}>
                {[
                  ["To Do", todoTasks, "warning"],
                  ["In Progress", inProgressTasks, "info"],
                  ["Completed", completedTasks, "success"],
                ].map(([label, value, color]) => (
                  <Box key={label}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.75 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value} ({Math.round((value / reportTotal) * 100)}%)
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "action.hover",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${(value / reportTotal) * 100}%`,
                          bgcolor: `${color}.main`,
                          borderRadius: 5,
                          transition: "width 300ms ease",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={600}>
                Scrum Flow Chart
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Live task count in each board column.
              </Typography>
              <Stack spacing={1.5}>
                {flowData.map((item) => (
                  <Box key={item.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.count}</Typography>
                    </Stack>
                    <Box sx={{ height: 18, borderRadius: 2, bgcolor: "action.hover", overflow: "hidden" }}>
                      <Box sx={{
                        width: `${(item.count / maxFlowCount) * 100}%`,
                        height: "100%",
                        minWidth: item.count ? 12 : 0,
                        bgcolor: "secondary.main",
                        borderRadius: 2,
                        transition: "width 300ms ease",
                      }} />
                    </Box>
                  </Box>
                ))}
                {!flowData.length && (
                  <Alert severity="info">Create workflow columns to see the Scrum flow chart.</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* =================================================
              SPRINT LIST
          ================================================= */}

          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              mb: 2,
            }}
          >
            Sprints
          </Typography>

          {sprints.length === 0 ? (

            <Alert
              severity="info"
              sx={{
                mb: 3,
              }}
            >
              No sprints found for this
              project. Click{" "}
              <strong>Add Sprint</strong>{" "}
              to create the first sprint.
            </Alert>

          ) : (

            <Grid
              container
              spacing={2}
              sx={{
                mb: 4,
              }}
            >

              {sprints.map(
                (sprint) => (

                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    key={sprint.id}
                  >

                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >

                      <CardContent
                        sx={{
                          flexGrow: 1,
                        }}
                      >

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >

                          <Typography
                            variant="h6"
                            fontWeight={600}
                          >
                            {sprint.name}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              sprint.status ||
                              "PLANNED"
                            }
                            color={
                              getStatusColor(
                                sprint.status
                              )
                            }
                          />

                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            minHeight: 42,
                          }}
                        >
                          {sprint.goal ||
                            "No sprint goal provided"}
                        </Typography>

                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />

                        <Stack
                          spacing={1}
                        >

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              Start:
                            </strong>{" "}
                            {sprint.startDate ||
                              "-"}
                          </Typography>

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              End:
                            </strong>{" "}
                            {sprint.endDate ||
                              "-"}
                          </Typography>

                          <Typography
                            variant="body2"
                          >
                            <strong>
                              Tasks:
                            </strong>{" "}
                            {
                              getTaskCountForSprint(
                                sprint.id
                              )
                            }
                          </Typography>

                        </Stack>

                      </CardContent>

                      <Box
                        sx={{
                          p: 2,
                          pt: 0,
                        }}
                      >

                        <Stack
                          direction="row"
                          spacing={1}
                        >

                          <Button
                            size="small"
                            variant="outlined"
                            fullWidth
                            onClick={() =>
                              handleEditSprint(
                                sprint
                              )
                            }
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={() =>
                              handleDeleteClick(
                                sprint
                              )
                            }
                          >
                            Delete
                          </Button>

                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ViewKanban />}
                            fullWidth
                            onClick={() =>
                              navigate(`/admin/sprints/${sprint.id}/board`)
                            }
                          >
                            Drag & Drop Board
                          </Button>

                        </Stack>

                      </Box>

                    </Card>

                  </Grid>

                )
              )}

            </Grid>

          )}

          {/* =================================================
              PROJECT TASKS
          ================================================= */}

          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              mb: 2,
            }}
          >
            Project Tasks
          </Typography>

          {tasks.length === 0 ? (

            <Alert severity="info">
              No tasks found for this
              project.
            </Alert>

          ) : (

            <Card>

              <CardContent>

                <Stack
                  spacing={1.5}
                >

                  {tasks.map(
                    (task) => (

                      <Box
                        key={task.id}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor:
                            "divider",
                          borderRadius: 2,
                        }}
                      >

                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                          justifyContent="space-between"
                        >

                          <Box>

                            <Typography
                              fontWeight={600}
                            >
                              {task.taskKey
                                ? `${task.taskKey} - `
                                : ""}
                              {task.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Sprint:{" "}
                              {task.sprint?.name ||
                                "Backlog"}
                            </Typography>

                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                          >

                            <Chip
                              size="small"
                              label={
                                task.status ||
                                "TODO"
                              }
                            />

                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                task.priority ||
                                "MEDIUM"
                              }
                            />

                          </Stack>

                        </Stack>

                      </Box>

                    )
                  )}

                </Stack>

              </CardContent>

            </Card>

          )}

        </>

      )}

      {/* =====================================================
          CREATE / EDIT SPRINT DIALOG
      ===================================================== */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          {editingSprint
            ? "Edit Sprint"
            : "Create Sprint"}
        </DialogTitle>

        <DialogContent>

          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >

            <TextField
              label="Sprint Name"
              name="name"
              value={sprintForm.name}
              onChange={handleFormChange}
              fullWidth
              required
            />

            <TextField
              label="Sprint Goal"
              name="goal"
              value={sprintForm.goal}
              onChange={handleFormChange}
              fullWidth
              multiline
              minRows={3}
            />

            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={
                sprintForm.startDate
              }
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={
                sprintForm.endDate
              }
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <FormControl fullWidth>

              <InputLabel>
                Status
              </InputLabel>

              <Select
                name="status"
                value={
                  sprintForm.status
                }
                label="Status"
                onChange={
                  handleFormChange
                }
              >

                <MenuItem value="PLANNED">
                  Planned
                </MenuItem>

                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Completed
                </MenuItem>

                <MenuItem value="CANCELLED">
                  Cancelled
                </MenuItem>

              </Select>

            </FormControl>

          </Stack>

        </DialogContent>

        <DialogActions>

          <Button
            onClick={handleCloseDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveSprint}
            disabled={saving}
          >

            {saving ? (
              <CircularProgress
                size={22}
              />
            ) : (
              editingSprint
                ? "Update Sprint"
                : "Create Sprint"
            )}

          </Button>

        </DialogActions>

      </Dialog>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Sprint"
        message={
          sprintToDelete
            ? `Are you sure you want to delete "${sprintToDelete.name}"?`
            : "Are you sure you want to delete this sprint?"
        }
        onConfirm={
          handleDeleteSprint
        }
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSprintToDelete(null);
        }}
      />

      {/* =====================================================
          SNACKBAR
      ===================================================== */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          onClose={handleSnackbarClose}
          severity={messageType}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {message}
        </Alert>

      </Snackbar>

    </Box>
  );
};

export default SprintProcessPage;