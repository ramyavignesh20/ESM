import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import AssigneeSelect from "./AssigneeSelect";

const initialForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  projectId: "",
  sprintId: "",
  assigneeId: "",
  columnId: "",
  dueDate: "",
};

export default function TaskForm({
  open,
  onClose,
  onSubmit,
  task = null,
  projectId = null,
  sprintId = null,
  projects = [],
  sprints = [],
  columns = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",

        projectId:
          task.projectId ||
          task.project?.id ||
          projectId ||
          "",

        sprintId:
          task.sprintId ||
          task.sprint?.id ||
          sprintId ||
          "",

        assigneeId:
          task.assigneeId ||
          task.assignee?.id ||
          "",

        columnId:
          task.columnId ||
          task.columnState?.id ||
          "",

        dueDate: task.dueDate || "",
      });
    } else {
      setForm({
        ...initialForm,
        projectId: projectId || "",
        sprintId: sprintId || "",
      });
    }

    setErrors({});
  }, [
    task,
    projectId,
    sprintId,
    open,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title =
        "Task title is required";
    }

    if (!form.projectId) {
      newErrors.projectId =
        "Project is required";
    }

    if (!form.assigneeId) {
      newErrors.assigneeId =
        "Assignee is required";
    }

    if (!form.priority) {
      newErrors.priority =
        "Priority is required";
    }

    if (!form.columnId) {
      newErrors.columnId =
        "Status/Column is required";
    }

    if (!form.dueDate) {
      newErrors.dueDate =
        "Due date is required";
    }

    const today =
      new Date().toISOString().split("T")[0];

    if (
      form.dueDate &&
      form.dueDate < today
    ) {
      newErrors.dueDate =
        "Due date cannot be in the past";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      ...form,

      projectId:
        Number(form.projectId),

      sprintId:
        form.sprintId
          ? Number(form.sprintId)
          : null,

      assigneeId:
        Number(form.assigneeId),

      columnId:
        Number(form.columnId),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {task ? "Edit Task" : "Create Task"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>

        <DialogContent>

          {/* PROJECT */}

          <TextField
            select
            fullWidth
            label="Project"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            disabled={Boolean(projectId)}
            error={Boolean(errors.projectId)}
            helperText={errors.projectId}
            margin="normal"
          >
            {projects.map((project) => (
              <MenuItem
                key={project.id}
                value={project.id}
              >
                {project.name}
              </MenuItem>
            ))}
          </TextField>

          {/* SPRINT */}

          <TextField
            select
            fullWidth
            label="Sprint"
            name="sprintId"
            value={form.sprintId}
            onChange={handleChange}
            disabled={Boolean(sprintId)}
            margin="normal"
          >
            <MenuItem value="">
              No Sprint
            </MenuItem>

            {sprints.map((sprint) => (
              <MenuItem
                key={sprint.id}
                value={sprint.id}
              >
                {sprint.name}
              </MenuItem>
            ))}
          </TextField>

          {/* TITLE */}

          <TextField
            fullWidth
            label="Task Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={Boolean(errors.title)}
            helperText={errors.title}
            margin="normal"
            required
          />

          {/* DESCRIPTION */}

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            margin="normal"
          />

          {/* ASSIGNEE */}

          <AssigneeSelect
            value={form.assigneeId}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                assigneeId: value,
              }))
            }
          />

          {errors.assigneeId && (
            <Box
              sx={{
                color: "error.main",
                fontSize: 12,
                mt: -1,
              }}
            >
              {errors.assigneeId}
            </Box>
          )}

          {/* PRIORITY */}

          <TextField
            select
            fullWidth
            label="Priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            error={Boolean(errors.priority)}
            helperText={errors.priority}
            margin="normal"
          >
            <MenuItem value="LOW">
              Low
            </MenuItem>

            <MenuItem value="MEDIUM">
              Medium
            </MenuItem>

            <MenuItem value="HIGH">
              High
            </MenuItem>

            <MenuItem value="CRITICAL">
              Critical
            </MenuItem>
          </TextField>

          {/* COLUMN */}

          <TextField
            select
            fullWidth
            label="Workflow Column"
            name="columnId"
            value={form.columnId}
            onChange={handleChange}
            error={Boolean(errors.columnId)}
            helperText={
              errors.columnId ||
              "Example: Analysis, Coding, Testing, Done"
            }
            margin="normal"
          >
            {columns.map((column) => (
              <MenuItem
                key={column.id}
                value={column.id}
              >
                {column.name}
              </MenuItem>
            ))}
          </TextField>

          {/* DUE DATE */}

          <TextField
            fullWidth
            type="date"
            label="Due Date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            error={Boolean(errors.dueDate)}
            helperText={errors.dueDate}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
          >
            {task
              ? "Update Task"
              : "Create Task"}
          </Button>
        </DialogActions>

      </Box>
    </Dialog>
  );
}