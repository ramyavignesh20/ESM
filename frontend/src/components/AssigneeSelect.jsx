import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from "@mui/material";
import api from "../services/api";

export default function AssigneeSelect({
  value,
  onChange,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load users",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedUser =
    users.find(
      (user) => Number(user.id) === Number(value)
    ) || null;

  return (
    <Autocomplete
      options={users}
      value={selectedUser}
      loading={loading}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.id : "");
      }}
      getOptionLabel={(option) =>
        option.fullName ||
        option.username ||
        option.email ||
        ""
      }
      isOptionEqualToValue={(option, value) =>
        Number(option.id) === Number(value.id)
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Assignee"
          required
          margin="normal"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress
                    size={20}
                  />
                ) : null}

                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}