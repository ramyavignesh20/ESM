import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  HourglassEmpty,
  PendingActions,
  TrendingUp,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";

import {
  getUserDashboard,
  updateTaskProgress,
} from "../api/userApi";

const UserDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboard = await getUserDashboard();
      const taskData = Array.isArray(dashboard?.myTasks)
        ? dashboard.myTasks
        : [];
      const projectMap = new Map();
      taskData.forEach((task) => {
        if (task?.project?.id) {
          projectMap.set(task.project.id, task.project);
        }
      });

      setProjects([...projectMap.values()]);
      setTasks(taskData);
      setColumns(
        Array.isArray(dashboard?.boardColumns)
          ? dashboard.boardColumns
          : []
      );
    } catch (err) {
      console.error("User dashboard loading error:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You do not have permission to view this dashboard.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = async (task, columnId) => {
    const column = columns.find(
      (item) => String(item.id) === String(columnId)
    );
    if (!column) return;

    const normalized = normalizeStatus(column.name);
    const status = normalized.includes("DONE") ||
      normalized.includes("COMPLETE") ||
      normalized.includes("CLOSED")
      ? "DONE"
      : normalized.includes("PROGRESS") ||
        normalized.includes("CODING") ||
        normalized.includes("DEVELOP") ||
        normalized.includes("TEST")
        ? "IN_PROGRESS"
        : "TODO";

    const previousTasks = tasks;
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status,
              columnState: column,
              columnStateId: column.id,
            }
          : item
      )
    );
    setUpdatingTaskId(task.id);
    setError("");

    try {
      const updated = await updateTaskProgress(task.id, column.id, status);
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updated : item))
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(
        err?.response?.data?.message ||
          "Unable to update task progress."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const extractData = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.content)) {
      return response.data.content;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    return [];
  };

  const normalizeStatus = (status) => {
    if (!status) {
      return "";
    }

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
  };

  const stats = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter((task) => {
      const status = normalizeStatus(task.status);

      return [
        "DONE",
        "COMPLETED",
        "COMPLETE",
        "CLOSED",
      ].includes(status);
    }).length;

    const inProgress = tasks.filter((task) => {
      const status = normalizeStatus(task.status);

      return [
        "IN_PROGRESS",
        "INPROGRESS",
        "PROGRESS",
        "DOING",
      ].includes(status);
    }).length;

    const todo = tasks.filter((task) => {
      const status = normalizeStatus(task.status);

      return [
        "TODO",
        "TO_DO",
        "OPEN",
        "PENDING",
      ].includes(status);
    }).length;

    const completionPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      completionPercentage,
    };
  }, [tasks]);

  const getTaskProjectName = (task) => {
    if (task?.project?.name) {
      return task.project.name;
    }

    if (task?.projectName) {
      return task.projectName;
    }

    return "No project";
  };

  const getPriorityColor = (priority) => {
    switch (normalizeStatus(priority)) {
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

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "DONE":
      case "COMPLETED":
      case "COMPLETE":
        return "success";

      case "IN_PROGRESS":
      case "INPROGRESS":
      case "DOING":
        return "info";

      case "TODO":
      case "TO_DO":
      case "PENDING":
        return "warning";

      default:
        return "default";
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
  }) => {
    return (
      <Card
        sx={{
          height: "100%",
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {title}
              </Typography>

              <Typography variant="h4" fontWeight={700}>
                {value}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${color}.light`,
                color: `${color}.main`,
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="My Dashboard"
          subtitle="Overview of your projects and tasks"
        />

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="My Dashboard"
        subtitle="Overview of your projects and assigned tasks"
      />

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Projects"
            value={projects.length}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<Assignment />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<HourglassEmpty />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Completion Progress */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Task Completion
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h3"
                  fontWeight={700}
                >
                  {stats.completionPercentage}%
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  completed
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={stats.completionPercentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {stats.completed} completed
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {stats.total} total
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Status */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Task Status
              </Typography>

              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <PendingActions color="warning" />

                    <Typography>
                      To Do
                    </Typography>
                  </Stack>

                  <Chip
                    label={stats.todo}
                    color="warning"
                    size="small"
                  />
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <HourglassEmpty color="info" />

                    <Typography>
                      In Progress
                    </Typography>
                  </Stack>

                  <Chip
                    label={stats.inProgress}
                    color="info"
                    size="small"
                  />
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <CheckCircle color="success" />

                    <Typography>
                      Completed
                    </Typography>
                  </Stack>

                  <Chip
                    label={stats.completed}
                    color="success"
                    size="small"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Projects */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                My Projects
              </Typography>

              {projects.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 3, textAlign: "center" }}
                >
                  No projects available.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {projects.slice(0, 5).map((project) => (
                    <Box
                      key={project.id}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography fontWeight={600}>
                            {project.name ||
                              `Project ${project.id}`}
                          </Typography>

                          {project.projectKey && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {project.projectKey}
                            </Typography>
                          )}
                        </Box>

                        {project.status && (
                          <Chip
                            label={project.status}
                            size="small"
                            color={
                              normalizeStatus(project.status) ===
                              "ACTIVE"
                                ? "success"
                                : "default"
                            }
                          />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Recent Tasks
              </Typography>

              {tasks.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 3, textAlign: "center" }}
                >
                  No tasks available.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {tasks.slice(0, 5).map((task) => (
                    <Box
                      key={task.id || task.taskKey}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        fontWeight={600}
                        sx={{
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title || "Untitled Task"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 1 }}
                      >
                        {getTaskProjectName(task)}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        {task.status && (
                          <Chip
                            label={task.status}
                            size="small"
                            color={getStatusColor(task.status)}
                          />
                        )}

                        {columns.length > 0 && (
                          <Select
                            size="small"
                            value={String(
                              task.columnState?.id ??
                                task.columnStateId ??
                                ""
                            )}
                            displayEmpty
                            disabled={updatingTaskId === task.id}
                            onChange={(event) =>
                              handleProgressChange(
                                task,
                                event.target.value
                              )
                            }
                            sx={{ minWidth: 130 }}
                          >
                            <MenuItem value="" disabled>
                              Move task
                            </MenuItem>
                            {columns.map((column) => (
                              <MenuItem
                                key={column.id}
                                value={String(column.id)}
                              >
                                {column.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}

                        {task.priority && (
                          <Chip
                            label={task.priority}
                            size="small"
                            variant="outlined"
                            color={getPriorityColor(task.priority)}
                          />
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;