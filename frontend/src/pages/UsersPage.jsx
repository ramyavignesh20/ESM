import React, { useEffect, useState } from "react";
import {
  Alert, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField
} from "@mui/material";
import { Add } from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../api/userApi";

const empty = {
  username: "", password: "", email: "", mobile: "", fullName: "",
  role: "USER", active: true
};

export default function UsersPage({ notify }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = () => getUsers().then(setUsers).catch(() => setError("Could not load users."));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await updateUser(editing.id, form);
      else await createUser(form);
      notify(editing ? "User updated." : "User created.");
      setOpen(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save user.");
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete user "${user.fullName || user.username}"?`)) return;
    try {
      await deleteUser(user.id);
      notify("User deleted.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete user.");
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Users & Assignees" subtitle="Manage administrators and task assignees."
        action={<Button variant="contained" startIcon={<Add />} onClick={() => {
          setEditing(null); setForm(empty); setOpen(true);
        }}>Add User</Button>} />
      {error && <Alert severity="error">{error}</Alert>}
      <Card><CardContent sx={{ p: 0 }}>
        <Table>
          <TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Username</TableCell>
            <TableCell>Email</TableCell><TableCell>Role</TableCell>
            <TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {users.map((user) => <TableRow key={user.id} hover>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><Chip size="small" label={user.role} /></TableCell>
              <TableCell><Chip size="small" color={user.active ? "success" : "default"}
                label={user.active ? "Active" : "Inactive"} /></TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => {
                  setEditing(user);
                  setForm({ ...user, password: "" });
                  setOpen(true);
                }}>Edit</Button>
                <Button size="small" color="error" onClick={() => remove(user)}>Delete</Button>
              </TableCell>
            </TableRow>)}
            {!users.length && <TableRow><TableCell colSpan={6}>
              <div className="empty-state">No users found.</div>
            </TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent><Stack spacing={2} mt={1}>
          <TextField label="Full Name" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <TextField label="Username" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <TextField label={editing ? "New Password (optional)" : "Password"} type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <TextField label="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Mobile" value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <TextField select label="Role" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="USER">User / Assignee</MenuItem>
            <MenuItem value="ADMIN">Administrator</MenuItem>
          </TextField>
          <TextField select label="Status" value={form.active ? "true" : "false"}
            onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
            <MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}
