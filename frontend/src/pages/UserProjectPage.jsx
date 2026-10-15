import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import {
  Folder,
  PlayArrow,
  CheckCircle,
  PauseCircle,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { getUserProjects } from "../services/api";

const UserProjectPage = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUserProjects();

      // Support both Axios response and direct array response
      const data = Array.isArray(response)
        ? response
        : response?.data;

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load user projects:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "ACTIVE":
        return "success";

      case "COMPLETED":
        return "primary";

      case "ON_HOLD":
      case "PAUSED":
        return "warning";

      case "CANCELLED":
        return "error";

      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "ACTIVE":
        return <PlayArrow fontSize="small" />;

      case "COMPLETED":
        return <CheckCircle fontSize="small" />;

      case "ON_HOLD":
      case "PAUSED":
        return <PauseCircle fontSize="small" />;

      default:
        return <Folder fontSize="small" />;
    }
  };

  const handleProjectClick = (project) => {
    if (!project?.id) return;

    navigate(`/user/projects/${project.id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="My Projects"
        subtitle="View and manage the projects assigned to you"
      />

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography color="text.secondary">
              Loading projects...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadProjects}
          >
            Retry
          </Button>
        </Stack>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 6 }}
            >
              <Folder
                sx={{
                  fontSize: 64,
                  color: "text.secondary",
                }}
              />

              <Typography variant="h6">
                No Projects Found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                You currently don't have any projects assigned to you.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {!loading && !error && projects.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {projects.map((project) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={project.id}
            >
              <Card
                onClick={() => handleProjectClick(project)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderRadius: 3,

                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Icon + status */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "primary.light",
                          color: "primary.main",
                        }}
                      >
                        <Folder />
                      </Box>

                      <Chip
                        size="small"
                        icon={getStatusIcon(project.status)}
                        label={project.status || "ACTIVE"}
                        color={getStatusColor(project.status)}
                        variant="outlined"
                      />
                    </Stack>

                    {/* Project name */}
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name || "Unnamed Project"}
                      </Typography>

                      {project.projectKey && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Project Key: {project.projectKey}
                        </Typography>
                      )}
                    </Box>

                    {/* Description */}
                    {project.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 60,
                        }}
                      >
                        {project.description}
                      </Typography>
                    )}

                    {/* Project information */}
                    <Stack spacing={1}>
                      {project.ownerName && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Owner
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={600}
                          >
                            {project.ownerName}
                          </Typography>
                        </Stack>
                      )}

                      {project.startDate && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Start Date
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={600}
                          >
                            {project.startDate}
                          </Typography>
                        </Stack>
                      )}

                      {project.endDate && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            End Date
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={600}
                          >
                            {project.endDate}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Open button */}
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleProjectClick(project);
                      }}
                    >
                      Open Project
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserProjectPage;