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
  projectKey: "",
  status: "ACTIVE",
};

export default function ProjectForm({
  open,
  onClose,
  onSubmit,
  project = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (project) {
      setForm({
        name: project.name ?? "",
        projectKey: project.projectKey ?? "",
        status: project.status ?? "ACTIVE",
      });
    } else {
      setForm({ ...initialForm });
    }

    setErrors({});
  }, [project, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!form.projectKey.trim()) {
      newErrors.projectKey = "Project key is required";
    } else if (!/^[A-Za-z0-9_-]+$/.test(form.projectKey.trim())) {
      newErrors.projectKey =
        "Project key can contain only letters, numbers, _ or -";
    }

    if (!form.status) {
      newErrors.status = "Project status is required";
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
      projectKey: form.projectKey.trim().toUpperCase(),
      status: form.status,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("PROJECT FORM SUBMIT ERROR:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {project ? "Edit Project" : "Create Project"}
      </DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        <DialogContent>

          {/* PROJECT NAME */}
          <TextField
            fullWidth
            label="Project Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            margin="normal"
            autoFocus
          />

          {/* PROJECT KEY */}
          <TextField
            fullWidth
            label="Project Key"
            name="projectKey"
            value={form.projectKey}
            onChange={handleChange}
            error={Boolean(errors.projectKey)}
            helperText={
              errors.projectKey ||
              "Example: ESM, CRM, HRMS"
            }
            margin="normal"
            inputProps={{
              maxLength: 20,
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
            error={Boolean(errors.status)}
            helperText={errors.status}
            margin="normal"
          >
            <MenuItem value="ACTIVE">
              Active
            </MenuItem>

            <MenuItem value="PLANNED">
              Planned
            </MenuItem>

            <MenuItem value="COMPLETED">
              Completed
            </MenuItem>

            <MenuItem value="ARCHIVED">
              Archived
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
          >
            {project
              ? "Update Project"
              : "Create Project"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}