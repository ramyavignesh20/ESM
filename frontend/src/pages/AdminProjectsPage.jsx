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
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
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
  Search,
  Folder,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/api";

const emptyForm = {
  id: null,
  name: "",
  projectKey: "",
  status: "ACTIVE",
};

const AdminProjectPage = () => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProjects();

      const data = response?.data ?? response ?? [];

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProjects = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return projects;
    }

    return projects.filter((project) => {
      return (
        project?.name?.toLowerCase().includes(value) ||
        project?.projectKey?.toLowerCase().includes(value) ||
        project?.status?.toLowerCase().includes(value)
      );
    });
  }, [projects, search]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD
  // =========================================================

  const handleAdd = () => {
    setEditing(false);

    setForm({
      ...emptyForm,
    });

    setOpenDialog(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const handleEdit = (project) => {
    setEditing(true);

    setForm({
      id: project.id,
      name: project.name || "",
      projectKey: project.projectKey || "",
      status: project.status || "ACTIVE",
    });

    setOpenDialog(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);
    setForm(emptyForm);
  };

  // =========================================================
  // SAVE PROJECT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!form.projectKey.trim()) {
      setError("Project key is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        projectKey: form.projectKey.trim().toUpperCase(),
        status: form.status,
      };

      if (editing) {
        await updateProject(form.id, payload);
        setSuccess("Project updated successfully.");
      } else {
        await createProject(payload);
        setSuccess("Project created successfully.");
      }

      setOpenDialog(false);
      setForm(emptyForm);

      await loadProjects();
    } catch (err) {
      console.error("Project save error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE CONFIRMATION
  // =========================================================

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setDeleteDialog(true);
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================

  const handleDelete = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteProject(selectedProject.id);

      setSuccess("Project deleted successfully.");

      setDeleteDialog(false);
      setSelectedProject(null);

      await loadProjects();
    } catch (err) {
      console.error("Project delete error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to delete project."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS CHIP
  // =========================================================

  const getStatusChip = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACTIVE") {
      return (
        <Chip
          label="ACTIVE"
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }

    if (normalized === "COMPLETED") {
      return (
        <Chip
          label="COMPLETED"
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    if (normalized === "ON_HOLD") {
      return (
        <Chip
          label="ON HOLD"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        label={normalized || "UNKNOWN"}
        size="small"
        variant="outlined"
      />
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle="Create and manage enterprise scrum projects"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add Project
          </Button>
        }
      />

      {/* =====================================================
          SEARCH / ACTION BAR
      ====================================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ maxWidth: { sm: 500 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadProjects}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {String(error)}
        </Alert>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                minHeight: 250,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Folder
                sx={{
                  fontSize: 60,
                  mb: 2,
                  opacity: 0.4,
                }}
              />

              <Typography variant="h6" gutterBottom>
                No Projects Found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {search
                  ? "No projects match your search."
                  : "Create your first project to get started."}
              </Typography>

              {!search && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAdd}
                >
                  Add Project
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        /* =====================================================
           PROJECT CARDS
        ====================================================== */

        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={project.id}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 5,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    mb={2}
                  >
                    <Box
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      <Folder />
                    </Box>

                    {getStatusChip(project.status)}
                  </Stack>

                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      mb: 0.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Project Key:{" "}
                    <strong>{project.projectKey}</strong>
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    ID: {project.id}
                  </Typography>
                </CardContent>

                {/* ACTIONS */}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Tooltip title="Edit Project">
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </Button>
                  </Tooltip>

                  <Tooltip title="Delete Project">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(project)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* =====================================================
          ADD / EDIT PROJECT DIALOG
      ====================================================== */}

      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            {editing ? "Edit Project" : "Create Project"}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Project Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                autoFocus
                placeholder="Enter project name"
              />

              <TextField
                label="Project Key"
                name="projectKey"
                value={form.projectKey}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Example: ESM"
                helperText="Use a short unique key such as ESM, CRM, ERP"
                inputProps={{
                  maxLength: 20,
                }}
              />

              <TextField
                select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? (
                <CircularProgress size={22} />
              ) : editing ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <Dialog
        open={deleteDialog}
        onClose={() => {
          if (!saving) {
            setDeleteDialog(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Project?</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedProject?.name}</strong>?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            This action may affect related sprints and tasks.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
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
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
};

export default AdminProjectPage;