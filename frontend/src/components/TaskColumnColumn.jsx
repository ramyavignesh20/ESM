import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Divider,
  Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import TaskCard from "./TaskCard";

const TaskColumn = ({
  column,
  tasks = [],
  onAddTask,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onDrop,
  onDragOver,
}) => {
  const columnId = column?.id;
  const columnName = column?.name || column?.columnName || "Tasks";

  const handleDragOver = (event) => {
    event.preventDefault();

    if (onDragOver) {
      onDragOver(event, columnId);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (onDrop) {
      onDrop(event, columnId);
    }
  };

  const getTaskCount = () => {
    return Array.isArray(tasks) ? tasks.length : 0;
  };

  return (
    <Card
      elevation={2}
      sx={{
        width: 320,
        minWidth: 320,
        height: "fit-content",
        maxHeight: "calc(100vh - 220px)",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        backgroundColor: "background.default",
      }}
    >
      {/* Column Header */}
      <CardContent
        sx={{
          pb: 1.5,
          "&:last-child": {
            pb: 1.5,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ minWidth: 0 }}
          >
            <AssignmentOutlinedIcon
              fontSize="small"
              color="primary"
            />

            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{
                maxWidth: 190,
              }}
            >
              {columnName}
            </Typography>

            <Chip
              label={getTaskCount()}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                height: 24,
                minWidth: 30,
                fontWeight: 600,
              }}
            />
          </Stack>

          <Tooltip title="Column options">
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>

      <Divider />

      {/* Add Task Button */}
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => onAddTask && onAddTask(column)}
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Tasks Area */}
      <Box
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: 1.5,
          pt: 1.5,
          minHeight: 120,
          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-thumb": {
            borderRadius: 3,
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
      >
        {tasks.length === 0 ? (
          <Box
            sx={{
              minHeight: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              No tasks in this column
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <Box
                key={task.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "taskId",
                    String(task.id)
                  );

                  event.dataTransfer.setData(
                    "sourceColumnId",
                    String(columnId)
                  );
                }}
                sx={{
                  cursor: "grab",

                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
              >
                <TaskCard
                  task={task}
                  onClick={() =>
                    onTaskClick && onTaskClick(task)
                  }
                  onEdit={() =>
                    onEditTask && onEditTask(task)
                  }
                  onDelete={() =>
                    onDeleteTask && onDeleteTask(task)
                  }
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );
};

export default TaskColumn;
