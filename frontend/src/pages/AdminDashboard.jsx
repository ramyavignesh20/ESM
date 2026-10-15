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
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  Dashboard,
  Folder,
  DirectionsRun,
  Assignment,
  People,
  ViewColumn,
  CheckCircle,
  PendingActions,
} from "@mui/icons-material";

import { getProjects } from "../api/projectApi";
import { getSprints } from "../api/sprintApi";
import { getTasks } from "../api/taskApi";
import { getUsers } from "../api/userApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    sprints: 0,
    tasks: 0,
    users: 0,
    columns: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getArray = (response) => {
    if (Array.isArray(response)) return response;

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

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getProjects(),
        getSprints(),
        getTasks(),
        getUsers(),
      ]);

      const projects = results[0].status === "fulfilled"
        ? getArray(results[0].value)
        : [];

      const sprints = results[1].status === "fulfilled"
        ? getArray(results[1].value)
        : [];

      const tasks = results[2].status === "fulfilled"
        ? getArray(results[2].value)
        : [];

      const users = results[3].status === "fulfilled"
        ? getArray(results[3].value)
        : [];

      const completedTasks = tasks.filter((task) => {
        const status = String(task.status || "").toUpperCase();

        return (
          status === "DONE" ||
          status === "COMPLETED" ||
          status === "COMPLETE"
        );
      }).length;

      const pendingTasks = tasks.length - completedTasks;

      setStats({
        projects: projects.length,
        sprints: sprints.length,
        tasks: tasks.length,
        users: users.length,
        columns: 0,
        completedTasks,
        pendingTasks,
      });

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length > 0) {
        setError(
          "Some dashboard data could not be loaded. Please check that the backend APIs are running."
        );
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      icon: <Folder />,
      description: "Active and completed projects",
    },
    {
      title: "Total Sprints",
      value: stats.sprints,
      icon: <DirectionsRun />,
      description: "All project sprints",
    },
    {
      title: "Total Tasks",
      value: stats.tasks,
      icon: <Assignment />,
      description: "Tasks across projects",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <People />,
      description: "Registered ESM users",
    },
    {
      title: "Board Columns",
      value: stats.columns,
      icon: <ViewColumn />,
      description: "Configured workflow columns",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: <CheckCircle />,
      description: "Tasks marked as completed",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <PendingActions />,
      description: "Tasks still in progress",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Dashboard color="primary" />

            <Typography
              variant="h4"
              fontWeight={700}
              component="h1"
            >
              Admin Dashboard
            </Typography>
          </Stack>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage your Enterprise Scrum Management workspace.
          </Typography>
        </Box>

        <Chip
          label="Administrator"
          color="primary"
          variant="outlined"
        />
      </Stack>

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            minHeight: 350,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography color="text.secondary">
              Loading dashboard...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <>
          {/* Statistics */}
          <Grid container spacing={2.5}>
            {statCards.map((card) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={card.title}
              >
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: "0.2s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{ mt: 1 }}
                        >
                          {card.value}
                        </Typography>
                      </Box>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        }}
                      >
                        {card.icon}
                      </Paper>
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 1.5 }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Overview */}
          <Card
            elevation={2}
            sx={{
              mt: 3,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Workspace Overview
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <CheckCircle color="success" />

                      <Box>
                        <Typography fontWeight={600}>
                          Completed Tasks
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Tasks currently completed
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="success.main"
                    >
                      {stats.completedTasks}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <PendingActions color="warning" />

                      <Box>
                        <Typography fontWeight={600}>
                          Pending Tasks
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Tasks requiring work
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="warning.main"
                    >
                      {stats.pendingTasks}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;
