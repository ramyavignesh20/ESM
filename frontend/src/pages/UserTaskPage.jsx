import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from "@mui/material";
import {
  Assignment,
  CalendarMonth,
  CheckCircle,
  HourglassEmpty,
  PlayCircle,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";
import {
  getProjects,
  getSprints,
  getTasks,
} from "../services/api";

const UserTaskPage = () => {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSprint, setSelectedSprint] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, taskResponse] = await Promise.all([
        getProjects(),
        getTasks(),
      ]);

      const projectData = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse?.data || [];

      const taskData = Array.isArray(taskResponse)
        ? taskResponse
        : taskResponse?.data || [];

      setProjects(projectData);
      setTasks(taskData);
    } catch (err) {
      console.error("UserTaskPage load error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async (projectId) => {
    if (!projectId) {
      setSprints([]);
      setSelectedSprint("");
      return;
    }

    try {
      setLoadingTasks(true);
      setError("");

      const response = await getSprints(projectId);

      const sprintData = Array.isArray(response)
        ? response
        : response?.data || [];

      setSprints(sprintData);
      setSelectedSprint("");
    } catch (err) {
      console.error("Sprint loading error:", err);

      setSprints([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load sprints."
      );
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleProjectChange = (event) => {
    const projectId = event.target.value;

    setSelectedProject(projectId);

    loadSprints(projectId);
  };

  const filteredTasks = tasks.filter((task) => {
    const projectMatch =
      !selectedProject ||
      String(
        task.projectId ??
          task.project?.id ??
          ""
      ) === String(selectedProject);

    const sprintMatch =
      !selectedSprint ||
      String(
        task.sprintId ??
          task.sprint?.id ??
          ""
      ) === String(selectedSprint);

    return projectMatch && sprintMatch;
  });

  const getStatusColor = (status) => {
    const value = String(status || "").toUpperCase();

    if (
      value.includes("DONE") ||
      value.includes("COMPLETED") ||
      value.includes("CLOSED")
    ) {
      return "success";
    }

    if (
      value.includes("PROGRESS") ||
      value.includes("DEVELOPMENT") ||
      value.includes("CODING")
    ) {
      return "primary";
    }

    if (
      value.includes("TEST") ||
      value.includes("REVIEW") ||
      value.includes("QA")
    ) {
      return "warning";
    }

    return "default";
  };

  const getStatusIcon = (status) => {
    const value = String(status || "").toUpperCase();

    if (
      value.includes("DONE") ||
      value.includes("COMPLETED") ||
      value.includes("CLOSED")
    ) {
      return <CheckCircle fontSize="small" />;
    }

    if (
      value.includes("PROGRESS") ||
      value.includes("CODING") ||
      value.includes("DEVELOPMENT")
    ) {
      return <PlayCircle fontSize="small" />;
    }

    return <HourglassEmpty fontSize="small" />;
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return date;
    }
  };

  const getProjectName = (task) => {
    if (task.project?.name) return task.project.name;

    const project = projects.find(
      (p) =>
        String(p.id) ===
        String(task.projectId)
    );

    return project?.name || "Project";
  };

  const getSprintName = (task) => {
    if (task.sprint?.name) return task.sprint.name;

    const sprint = sprints.find(
      (s) =>
        String(s.id) ===
        String(task.sprintId)
    );

    return sprint?.name || "Sprint";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">
            Loading your tasks...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="My Tasks"
        subtitle="View and track your assigned scrum tasks"
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            Task Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>

                <Select
                  value={selectedProject}
                  label="Project"
                  onChange={handleProjectChange}
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
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                disabled={!selectedProject}
              >
                <InputLabel>Sprint</InputLabel>

                <Select
                  value={selectedSprint}
                  label="Sprint"
                  onChange={(e) =>
                    setSelectedSprint(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All Sprints
                  </MenuItem>

                  {sprints.map((sprint) => (
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
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Assignment color="primary" />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Tasks
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {filteredTasks.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <PlayCircle color="warning" />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    In Progress
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {
                      filteredTasks.filter((task) => {
                        const status = String(
                          task.status ??
                            task.columnState ??
                            ""
                        ).toUpperCase();

                        return (
                          status.includes("PROGRESS") ||
                          status.includes("CODING") ||
                          status.includes("DEVELOPMENT")
                        );
                      }).length
                    }
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <CheckCircle color="success" />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Completed
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {
                      filteredTasks.filter((task) => {
                        const status = String(
                          task.status ??
                            task.columnState ??
                            ""
                        ).toUpperCase();

                        return (
                          status.includes("DONE") ||
                          status.includes("COMPLETED") ||
                          status.includes("CLOSED")
                        );
                      }).length
                    }
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task List */}
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
              Assigned Tasks
            </Typography>

            {loadingTasks && (
              <CircularProgress size={24} />
            )}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {filteredTasks.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
              }}
            >
              <Assignment
                sx={{
                  fontSize: 55,
                  color: "text.disabled",
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
              >
                There are no tasks matching the
                selected filters.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredTasks.map((task) => {
                const status =
                  task.status ??
                  task.columnState ??
                  "PENDING";

                return (
                  <Card
                    key={task.id}
                    variant="outlined"
                    sx={{
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: 3,
                        transform:
                          "translateY(-1px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction={{
                          xs: "column",
                          md: "row",
                        }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={600}
                            >
                              {task.taskKey
                                ? `${task.taskKey} - `
                                : ""}
                              {task.title ||
                                task.name ||
                                "Untitled Task"}
                            </Typography>

                            <Chip
                              size="small"
                              icon={getStatusIcon(
                                status
                              )}
                              label={status}
                              color={getStatusColor(
                                status
                              )}
                            />
                          </Stack>

                          {task.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}

                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            spacing={{
                              xs: 1,
                              sm: 3,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              <strong>
                                Project:
                              </strong>{" "}
                              {getProjectName(task)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              <strong>
                                Sprint:
                              </strong>{" "}
                              {getSprintName(task)}
                            </Typography>

                            {task.assignee && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>
                                  Assignee:
                                </strong>{" "}
                                {task.assignee.fullName ||
                                  task.assignee.username ||
                                  task.assignee}
                              </Typography>
                            )}
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 1.5 }}
                          >
                            <CalendarMonth
                              fontSize="small"
                              color="disabled"
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Due:{" "}
                              {formatDate(
                                task.dueDate ||
                                  task.endDate
                              )}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserTaskPage;