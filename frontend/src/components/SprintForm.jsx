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

const initialForm = {
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  status: "PLANNED",
  projectId: "",
};

export default function SprintForm({
  open,
  onClose,
  onSubmit,
  sprint = null,
  projectId = null,
  projects = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (sprint) {
      const selectedProjectId =
        sprint.projectId ??
        sprint.project?.id ??
        projectId ??
        "";

      setForm({
        name: sprint.name ?? "",
        goal: sprint.goal ?? "",
        startDate: sprint.startDate ?? "",
        endDate: sprint.endDate ?? "",
        status: sprint.status ?? "PLANNED",
        projectId:
          selectedProjectId !== ""
            ? Number(selectedProjectId)
            : "",
      });
    } else {
      setForm({
        ...initialForm,
        projectId:
          projectId !== null &&
          projectId !== undefined &&
          projectId !== ""
            ? Number(projectId)
            : "",
      });
    }

    setErrors({});
  }, [sprint, projectId, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "projectId"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Sprint name is required";
    }

    if (
      form.projectId === "" ||
      form.projectId === null ||
      form.projectId === undefined
    ) {
      newErrors.projectId = "Project is required";
    }

    if (!form.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!form.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      newErrors.endDate =
        "End date cannot be before date";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      goal: form.goal.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      projectId: Number(form.projectId),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("SPRINT FORM SUBMIT ERROR:", error);
    }
  };

  /*
   * Important:
   * Only give MUI a projectId if that project actually exists
   * in the projects array.
   *
   * This prevents:
   * "out-of-range value '3' for the select"
   */
  const validProjectId =
    projects.some(
      (project) =>
        Number(project.id) === Number(form.projectId)
    )
      ? Number(form.projectId)
      : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {sprint ? "Edit Sprint" : "Create Sprint"}
      </DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        <DialogContent>

          {/* PROJECT */}
          <TextField
            select
            fullWidth
            label="Project"
            name="projectId"
            value={validProjectId}
            onChange={handleChange}
            disabled={Boolean(projectId)}
            error={Boolean(errors.projectId)}
            helperText={
              errors.projectId ||
              (projects.length === 0
                ? "No projects available"
                : "")
            }
            margin="normal"
          >
            <MenuItem value="">
              Select Project
            </MenuItem>

            {projects.map((project) => (
              <MenuItem
                key={project.id}
                value={Number(project.id)}
              >
                {project.name}
              </MenuItem>
            ))}
          </TextField>

          {/* SPRINT NAME */}
          <TextField
            fullWidth
            label="Sprint Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            margin="normal"
          />

          {/* GOAL */}
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Sprint Goal"
            name="goal"
            value={form.goal}
            onChange={handleChange}
            margin="normal"
          />

          {/* START DATE */}
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* END DATE */}
          <TextField
            fullWidth
            type="date"
            label="End Date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: form.startDate || undefined,
            }}
          />

          {/* STATUS */}
          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="PLANNED">
              Planned
            </MenuItem>

            <MenuItem value="ACTIVE">
              Active
            </MenuItem>

            <MenuItem value="COMPLETED">
              Completed
            </MenuItem>
          </TextField>

        </DialogContent>

        <DialogActions>
          <Button
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              !onSubmit ||
              projects.length === 0 ||
              !validProjectId
            }
          >
            {sprint
              ? "Update Sprint"
              : "Create Sprint"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}