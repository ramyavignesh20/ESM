import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
  Visibility,
  Sprint,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onView,
}) => {
  const navigate = useNavigate();

  if (!project) {
    return null;
  }

  const projectId = project.id;

  const projectName = project.name || "Unnamed Project";

  const projectKey = project.projectKey || "N/A";

  const status = project.status || "ACTIVE";

  const getStatusColor = (value) => {
    switch (value?.toUpperCase()) {
      case "ACTIVE":
        return "success";

      case "COMPLETED":
        return "primary";

      case "ON_HOLD":
        return "warning";

      case "CANCELLED":
        return "error";

      default:
        return "default";
    }
  };

  const handleSprintProcess = () => {
    if (!projectId) {
      return;
    }

    navigate(`/admin/projects/${projectId}/sprints`);
  };

  const handleView = () => {
    if (onView) {
      onView(project);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              noWrap
              title={projectName}
            >
              {projectName}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Project Key: <strong>{projectKey}</strong>
            </Typography>
          </Box>

          <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Project Details */}
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>ID:</strong> {projectId || "N/A"}
          </Typography>

          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.description}
            </Typography>
          )}

          {project.createdAt && (
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong>{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 0,
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Project">
            <IconButton
              color="primary"
              onClick={handleView}
              disabled={!onView}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Project">
            <IconButton color="warning" onClick={handleEdit}>
              <Edit />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Project">
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>

        <Button
          variant="contained"
          size="small"
          startIcon={<Sprint />}
          onClick={handleSprintProcess}
          disabled={!projectId}
        >
          Sprints
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;