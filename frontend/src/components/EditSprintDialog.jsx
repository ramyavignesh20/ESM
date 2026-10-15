import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import { updateSprint } from "../api/taskApi";

export default function EditSprintDialog({
  open,
  sprint,
  onClose,
  onUpdated,
}) {

  const [form, setForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  useEffect(() => {

    if (sprint) {

      setForm({
        name: sprint.name || "",
        goal: sprint.goal || "",
        startDate: sprint.startDate || "",
        endDate: sprint.endDate || "",
        status: sprint.status || "",
      });

    }

  }, [sprint]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleSave = async () => {

    if (!form.name.trim()) {

      alert("Sprint name is required");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {

      alert(
        "End date cannot be before start date"
      );

      return;
    }

    try {

      await updateSprint(
        sprint.id,
        form
      );

      alert(
        "Sprint updated successfully"
      );

      onUpdated();

      onClose();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data ||
        "Failed to update sprint"
      );
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
        Edit Sprint
      </DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          label="Sprint Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Sprint Goal"
          name="goal"
          value={form.goal}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          type="date"
          label="Start Date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          fullWidth
          type="date"
          label="End Date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

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

          <MenuItem value="CANCELLED">
            Cancelled
          </MenuItem>

        </TextField>

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save Changes
        </Button>

        <Button
  variant="outlined"
  size="small"
  onClick={() => {
    setSelectedSprint(sprint);
    setEditSprintOpen(true);
  }}
>
  Edit
</Button>

      </DialogActions>

    </Dialog>
  );
}