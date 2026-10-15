import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const SprintCard = ({
  sprint,
  onEdit,
  onDelete,
  onView,
  onProcess,
}) => {
  if (!sprint) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
        return "default";

      case "ACTIVE":
        return "success";

      case "COMPLETED":
        return "primary";

      case "CANCELLED":
        return "error";

      default:
        return "default";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const projectName =
    sprint.project?.name ||
    sprint.projectName ||
    "No Project";

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
          transform: "translateY(-3px)",
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
          spacing={1}
          mb={1}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                wordBreak: "break-word",
              }}
            >
              {sprint.name || "Unnamed Sprint"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {projectName}
            </Typography>
          </Box>

          <Chip
            label={sprint.status || "PLANNED"}
            color={getStatusColor(sprint.status)}
            size="small"
            sx={{
              fontWeight: 600,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Sprint Goal */}
        <Typography
          variant="subtitle2"
          fontWeight={600}
          gutterBottom
        >
          Sprint Goal
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 42,
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {sprint.goal || "No sprint goal provided."}
        </Typography>

        {/* Dates */}
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              <strong>Start:</strong>{" "}
              {formatDate(sprint.startDate)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              <strong>End:</strong>{" "}
              {formatDate(sprint.endDate)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Divider />

      {/* Actions */}
      <CardActions
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {onView && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => onView(sprint)}
          >
            View
          </Button>
        )}

        {onProcess && (
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => onProcess(sprint)}
          >
            Process
          </Button>
        )}

        {onEdit && (
          <Button
            size="small"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(sprint)}
          >
            Edit
          </Button>
        )}

        {onDelete && (
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(sprint)}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default SprintCard;