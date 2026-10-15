import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
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
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projectApi";

const emptyProject = {
  name: "",
  projectKey: "",
  status: "ACTIVE",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

      if (editingId) {
        await updateProject(editingId, form);
      } else {
        await createProject(form);
      }

      setForm(emptyProject);
      setEditingId(null);

      await loadProjects();
    } catch (err) {
      console.error("Failed to save project:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);

    setForm({
      name: project.name || "",
      projectKey: project.projectKey || "",
      status: project.status || "ACTIVE",
    });

    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProject(id);

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyProject);
      }

      await loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to delete project."
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyProject);
    setError("");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Projects
          </Typography>

          <Typography color="text.secondary">
            Manage enterprise scrum projects
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadProjects}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {typeof error === "string" ? error : "Something went wrong."}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Project Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                {editingId ? "Edit Project" : "Create Project"}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Project Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Project Key"
                    name="projectKey"
                    value={form.projectKey}
                    onChange={handleChange}
                    fullWidth
                    required
                    helperText="Example: ESM"
                  />

                  <TextField
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Add />}
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Project"
                        : "Create Project"}
                    </Button>

                    {editingId && (
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Project List
              </Typography>

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 5,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : projects.length === 0 ? (
                <Typography color="text.secondary">
                  No projects found.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      variant="outlined"
                    >
                      <CardContent>
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          justifyContent="space-between"
                          alignItems={{
                            xs: "flex-start",
                            sm: "center",
                          }}
                          spacing={2}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                            >
                              {project.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Key: {project.projectKey}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Status: {project.status || "ACTIVE"}
                            </Typography>
                          </Box>

                          <Stack direction="row">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(project)}
                            >
                              <Edit />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDelete(project.id)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
