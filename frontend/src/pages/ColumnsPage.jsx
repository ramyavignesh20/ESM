import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Add,
  Delete,
  DragIndicator,
  Edit,
} from "@mui/icons-material";

import { useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../api/columnApi";

import { getProjects } from "../api/projectApi";

export default function ColumnsPage({ notify }) {
  const { projectId: routeProjectId } = useParams();

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [columns, setColumns] = useState([]);

  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [saving, setSaving] = useState(false);

  // ----------------------------------------------------
  // LOAD PROJECTS
  // ----------------------------------------------------
  const loadProjects = async () => {
    try {
      setError("");
      setLoadingProjects(true);

      const response = await getProjects();

      const list = Array.isArray(response)
        ? response
        : response?.data || [];

      setProjects(list);

      if (routeProjectId) {
        setProjectId(String(routeProjectId));
      } else if (list.length > 0) {
        setProjectId(String(list[0].id));
      }
    } catch (err) {
      console.error("Could not load projects:", err);
      setError(
        err?.response?.data?.message ||
          "Could not load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  // ----------------------------------------------------
  // LOAD COLUMNS
  // ----------------------------------------------------
  const loadColumns = async (id) => {
    if (!id) {
      setColumns([]);
      return;
    }

    try {
      setError("");
      setLoadingColumns(true);

      const response = await getColumns(id);

      const list = Array.isArray(response)
        ? response
        : response?.data || [];

      setColumns(list);
    } catch (err) {
      console.error("Could not load columns:", err);

      setColumns([]);

      setError(
        err?.response?.data?.message ||
          "Could not load columns."
      );
    } finally {
      setLoadingColumns(false);
    }
  };

  // ----------------------------------------------------
  // INITIAL PROJECT LOAD
  // ----------------------------------------------------
  useEffect(() => {
    loadProjects();
  }, [routeProjectId]);

  // ----------------------------------------------------
  // LOAD COLUMNS WHEN PROJECT CHANGES
  // ----------------------------------------------------
  useEffect(() => {
    if (projectId) {
      loadColumns(projectId);
    }
  }, [projectId]);

  // ----------------------------------------------------
  // ADD COLUMN
  // ----------------------------------------------------
  const add = async () => {
    setError("");

    if (!projectId) {
      setError("Please select a project.");
      return;
    }

    if (!name.trim()) {
      setError("Column name is required.");
      return;
    }

    try {
      setSaving(true);

      await createColumn({
        projectId: Number(projectId),
        name: name.trim(),
        position: columns.length,
      });

      setName("");

      if (notify) {
        notify("Column added successfully.");
      }

      await loadColumns(projectId);
    } catch (err) {
      console.error("Could not add column:", err);

      setError(
        err?.response?.data?.message ||
          "Could not add column."
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // EDIT COLUMN
  // ----------------------------------------------------
  const edit = async (column) => {
    const nextName = window.prompt(
      "Enter the new column name:",
      column.name
    );

    if (nextName === null) {
      return;
    }

    const trimmedName = nextName.trim();

    if (!trimmedName) {
      return;
    }

    if (trimmedName === column.name) {
      return;
    }

    try {
      setError("");

      await updateColumn(column.id, {
        projectId: Number(projectId),
        name: trimmedName,
        position:
          column.position !== undefined
            ? column.position
            : 0,
      });

      if (notify) {
        notify("Column updated successfully.");
      }

      await loadColumns(projectId);
    } catch (err) {
      console.error("Could not update column:", err);

      setError(
        err?.response?.data?.message ||
          "Could not update column."
      );
    }
  };

  // ----------------------------------------------------
  // DELETE COLUMN
  // ----------------------------------------------------
  const remove = async (column) => {
    const confirmed = window.confirm(
      `Delete column "${column.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteColumn(column.id);

      if (notify) {
        notify("Column deleted successfully.");
      }

      await loadColumns(projectId);
    } catch (err) {
      console.error("Could not delete column:", err);

      setError(
        err?.response?.data?.message ||
          "Could not delete column."
      );
    }
  };

  // ----------------------------------------------------
  // HANDLE PROJECT CHANGE
  // ----------------------------------------------------
  const handleProjectChange = (event) => {
    setProjectId(event.target.value);
    setColumns([]);
    setError("");
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title={
          routeProjectId
            ? "Project Scrum Columns"
            : "Scrum Columns"
        }
        subtitle="Create, update and delete the Scrum workflow columns."
      />

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ------------------------------------------------ */}
      {/* PROJECT + ADD COLUMN */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Project"
              value={projectId}
              onChange={handleProjectChange}
              disabled={
                Boolean(routeProjectId) ||
                loadingProjects
              }
            >
              {projects.map((project) => (
                <MenuItem
                  key={project.id}
                  value={String(project.id)}
                >
                  {project.name}
                </MenuItem>
              ))}
            </TextField>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >
              <TextField
                fullWidth
                label="New Column Name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    add();
                  }
                }}
                placeholder="Example: QA, UAT, Review"
              />

              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <Add />
                  )
                }
                onClick={add}
                disabled={
                  saving ||
                  loadingProjects ||
                  !projectId
                }
                sx={{
                  minWidth: 150,
                  minHeight: 56,
                }}
              >
                {saving ? "Adding..." : "Add Column"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ------------------------------------------------ */}
      {/* CURRENT WORKFLOW */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Current Workflow
            </Typography>

            {columns.length > 0 && (
              <Chip
                size="small"
                label={`${columns.length} ${
                  columns.length === 1
                    ? "Column"
                    : "Columns"
                }`}
              />
            )}
          </Stack>

          {loadingColumns ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              py={5}
            >
              <CircularProgress />
              <Typography
                color="text.secondary"
                mt={2}
              >
                Loading columns...
              </Typography>
            </Stack>
          ) : (
            <List>
              {columns.map((column, index) => (
                <ListItem
                  key={column.id}
                  divider
                  secondaryAction={
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                    >
                      <Chip
                        size="small"
                        label={`Position ${index + 1}`}
                      />

                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() =>
                          edit(column)
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() =>
                          remove(column)
                        }
                      >
                        Delete
                      </Button>
                    </Stack>
                  }
                >
                  <DragIndicator
                    color="disabled"
                    sx={{ mr: 1 }}
                  />

                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={600}
                      >
                        {column.name}
                      </Typography>
                    }
                    secondary={`Column ID: ${column.id}`}
                  />
                </ListItem>
              ))}

              {!columns.length && (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  No columns found for this project.
                </Typography>
              )}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
