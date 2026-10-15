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
  IconButton,
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
  EventNote,
  PlayArrow,
  Psychology,
  Refresh,
  RateReview,
  ViewKanban,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../api/sprintApi";

import { getProjects } from "../api/projectApi";


const initialForm = {
  id: null,
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  status: "PLANNED",
  projectId: "",
};


function SprintsPage() {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(initialForm);


  // ---------------------------------------------------------
  // Load projects
  // ---------------------------------------------------------
  const loadProjects = async () => {
    try {
      const response = await getProjects();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setProjects(data);

      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(data[0].id));
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to load projects."
      );
    }
  };


  // ---------------------------------------------------------
  // Load sprints
  // ---------------------------------------------------------
  const loadSprints = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getSprints();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setSprints(data);
    } catch (err) {
      console.error("Failed to load sprints:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You do not have permission to view sprints.");
      } else {
        setError(
          err?.response?.data?.message ||
          "Failed to load sprints."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  // ---------------------------------------------------------
  // Initial loading
  // ---------------------------------------------------------
  useEffect(() => {
    loadProjects();
    loadSprints();
  }, []);


  // ---------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------
  const handleRefresh = async () => {
    setSuccess("");
    await Promise.all([
      loadProjects(),
      loadSprints(),
    ]);
  };


  // ---------------------------------------------------------
  // Form changes
  // ---------------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ---------------------------------------------------------
  // Open create dialog
  // ---------------------------------------------------------
  const handleOpenCreate = () => {
    setEditing(false);

    setForm({
      ...initialForm,
      projectId: selectedProjectId || "",
    });

    setError("");
    setSuccess("");
    setOpenDialog(true);
  };


  // ---------------------------------------------------------
  // Open edit dialog
  // ---------------------------------------------------------
  const handleOpenEdit = (sprint) => {
    setEditing(true);

    const projectId =
      sprint?.project?.id ??
      sprint?.projectId ??
      "";

    setForm({
      id: sprint.id,
      name: sprint.name || "",
      goal: sprint.goal || "",
      startDate: sprint.startDate || "",
      endDate: sprint.endDate || "",
      status: sprint.status || "PLANNED",
      projectId: String(projectId),
    });

    setError("");
    setSuccess("");
    setOpenDialog(true);
  };


  // ---------------------------------------------------------
  // Close dialog
  // ---------------------------------------------------------
  const handleCloseDialog = () => {
    if (saving) return;

    setOpenDialog(false);

    setForm({
      ...initialForm,
      projectId: selectedProjectId || "",
    });
  };


  // ---------------------------------------------------------
  // Save sprint
  // ---------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Sprint name is required.");
      return;
    }

    if (!form.projectId) {
      setError("Please select a project.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!form.endDate) {
      setError("End date is required.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setSaving(true);

    try {
      /*
       * Backend SprintRequest expects:
       *
       * {
       *   name,
       *   goal,
       *   startDate,
       *   endDate,
       *   projectId
       * }
       *
       * Do NOT send:
       * project: { id: ... }
       */

      const payload = {
        name: form.name.trim(),
        goal: form.goal.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        projectId: Number(form.projectId),
        status: form.status,
      };

      if (editing) {
        await updateSprint(form.id, payload);
        setSuccess("Sprint updated successfully.");
      } else {
        await createSprint(payload);
        setSuccess("Sprint created successfully.");
      }

      setOpenDialog(false);

      setForm({
        ...initialForm,
        projectId: selectedProjectId || "",
      });

      await loadSprints();
    } catch (err) {
      console.error("Failed to save sprint:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data;

      if (err?.response?.status === 400) {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Invalid sprint data. Please check the form."
        );
      } else if (err?.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You do not have permission to modify sprints.");
      } else {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Failed to save sprint."
        );
      }
    } finally {
      setSaving(false);
    }
  };


  // ---------------------------------------------------------
  // Delete sprint
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sprint?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteSprint(id);

      setSuccess("Sprint deleted successfully.");

      await loadSprints();
    } catch (err) {
      console.error("Failed to delete sprint:", err);

      if (err?.response?.status === 403) {
        setError("You do not have permission to delete this sprint.");
      } else if (err?.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else {
        setError(
          err?.response?.data?.message ||
          "Failed to delete sprint."
        );
      }
    }
  };


  // ---------------------------------------------------------
  // Project filtering
  // ---------------------------------------------------------
  const filteredSprints = selectedProjectId
    ? sprints.filter((sprint) => {
        const projectId =
          sprint?.project?.id ??
          sprint?.projectId;

        return String(projectId) === String(selectedProjectId);
      })
    : sprints;


  // ---------------------------------------------------------
  // Status color
  // ---------------------------------------------------------
  const getStatusColor = (status) => {
    switch (status) {
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


  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <Box>
      <PageHeader
        title="Sprints"
        subtitle="Create, manage and track project sprints"
      />

      {/* Alerts */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}
      </Stack>


      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <FormControl
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 280,
                },
              }}
            >
              <InputLabel id="project-filter-label">
                Project
              </InputLabel>

              <Select
                labelId="project-filter-label"
                value={selectedProjectId}
                label="Project"
                onChange={(event) =>
                  setSelectedProjectId(event.target.value)
                }
              >
                {projects.length === 0 && (
                  <MenuItem value="">
                    No projects available
                  </MenuItem>
                )}

                {projects.map((project) => (
                  <MenuItem
                    key={project.id}
                    value={String(project.id)}
                  >
                    {project.name}
                    {project.projectKey
                      ? ` (${project.projectKey})`
                      : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
              >
                New Sprint
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>


      {/* Sprint count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredSprints.length} sprint
          {filteredSprints.length !== 1 ? "s" : ""}
        </Typography>
      </Box>


      {/* Loading */}
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
      ) : filteredSprints.length === 0 ? (
        <Card>
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              sx={{ py: 5 }}
            >
              <Typography variant="h6">
                No sprints found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Create a sprint to start planning your project.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
              >
                Create Sprint
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredSprints.map((sprint) => {
            const project =
              sprint?.project ||
              projects.find(
                (p) =>
                  String(p.id) ===
                  String(
                    sprint?.projectId
                  )
              );

            return (
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                        >
                          {sprint.name}
                        </Typography>

                        {project && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {project.name}
                            {project.projectKey
                              ? ` • ${project.projectKey}`
                              : ""}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        size="small"
                        label={sprint.status || "PLANNED"}
                        color={getStatusColor(
                          sprint.status
                        )}
                      />
                    </Stack>


                    {sprint.goal && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          minHeight: 40,
                        }}
                      >
                        {sprint.goal}
                      </Typography>
                    )}


                    <Divider sx={{ my: 2 }} />


                    <Stack spacing={1}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Start Date
                        </Typography>

                        <Typography variant="body2">
                          {sprint.startDate || "—"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          End Date
                        </Typography>

                        <Typography variant="body2">
                          {sprint.endDate || "—"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>


                  <Divider />

                  <Box sx={{ px: 1.5, pt: 1.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Scrum flow
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() =>
                          navigate(`/admin/sprints/${sprint.id}/planning`)
                        }
                      >
                        Planning
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewKanban />}
                        onClick={() =>
                          navigate(`/admin/sprints/${sprint.id}/board`)
                        }
                      >
                        Board
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RateReview />}
                        onClick={() =>
                          navigate(`/admin/sprints/${sprint.id}/review`)
                        }
                      >
                        Review
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Psychology />}
                        onClick={() =>
                          navigate(`/admin/sprints/${sprint.id}/retro`)
                        }
                      >
                        Retro
                      </Button>
                    </Stack>
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={1}
                    sx={{ p: 1.5 }}
                  >
                    {project?.id && (
                      <Button
                        size="small"
                        startIcon={<EventNote />}
                        onClick={() =>
                          navigate(`/admin/projects/${project.id}/process`)
                        }
                      >
                        Project Flow
                      </Button>
                    )}

                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() =>
                        handleOpenEdit(sprint)
                      }
                    >
                      Edit
                    </Button>

                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDelete(sprint.id)
                      }
                      title="Delete sprint"
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}


      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editing
              ? "Edit Sprint"
              : "Create New Sprint"}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel id="form-project-label">
                  Project
                </InputLabel>

                <Select
                  labelId="form-project-label"
                  name="projectId"
                  value={form.projectId}
                  label="Project"
                  onChange={handleChange}
                >
                  {projects.map((project) => (
                    <MenuItem
                      key={project.id}
                      value={String(project.id)}
                    >
                      {project.name}
                      {project.projectKey
                        ? ` (${project.projectKey})`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>


              <TextField
                fullWidth
                required
                label="Sprint Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Sprint 1"
              />


              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Sprint Goal"
                name="goal"
                value={form.goal}
                onChange={handleChange}
                placeholder="What should this sprint achieve?"
              />


              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  fullWidth
                  required
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Stack>


              <FormControl fullWidth>
                <InputLabel id="status-label">
                  Status
                </InputLabel>

                <Select
                  labelId="status-label"
                  name="status"
                  value={form.status}
                  label="Status"
                  onChange={handleChange}
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


          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress size={18} />
                ) : editing ? (
                  <Edit />
                ) : (
                  <Add />
                )
              }
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Update Sprint"
                  : "Create Sprint"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default SprintsPage;