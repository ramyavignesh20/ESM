import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TaskCard({
  task,
  onEdit,
  onDelete,
}) {
  const priorityColor = {
    LOW: "success",
    MEDIUM: "info",
    HIGH: "warning",
    CRITICAL: "error",
  };

  const assigneeName =
    task.assignee?.name ||
    task.assignee?.username ||
    task.assignee?.email ||
    "Unassigned";

  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        transition: "0.2s",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
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
              variant="caption"
              color="text.secondary"
            >
              {task.taskKey}
            </Typography>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 0.5 }}
            >
              {task.title}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={0.2}
          >
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() =>
                  onDelete(task)
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

        </Stack>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {task.priority && (
            <Chip
              size="small"
              label={task.priority}
              color={
                priorityColor[
                  task.priority
                ] || "default"
              }
            />
          )}

          {task.sprint?.name && (
            <Chip
              size="small"
              variant="outlined"
              label={task.sprint.name}
            />
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: 13,
            }}
          >
            {assigneeName
              .charAt(0)
              .toUpperCase()}
          </Avatar>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {assigneeName}
          </Typography>
        </Stack>

        {task.dueDate && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1.5,
            }}
          >
            Due: {task.dueDate}
          </Typography>
        )}

      </CardContent>
    </Card>
  );
}