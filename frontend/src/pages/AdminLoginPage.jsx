import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Login } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import EsmLogo from "../components/EsmLogo";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(
        form.username.trim(),
        form.password
      );

      console.log("Admin login response:", response);

      /*
       * Supports common backend response formats:
       * {
       *   token: "...",
       *   username: "admin",
       *   role: "ADMIN"
       * }
       *
       * or:
       * {
       *   jwt: "...",
       *   user: {...}
       * }
       */

      const token =
        response?.token ||
        response?.jwt ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.jwt;

      const user =
        response?.user ||
        response?.data?.user || {
          username:
            response?.username ||
            response?.data?.username ||
            form.username.trim(),
          role:
            response?.role ||
            response?.data?.role ||
            "ADMIN",
        };

      const role = String(
        user?.role ||
          response?.role ||
          response?.data?.role ||
          ""
      ).toUpperCase();

      if (!token) {
        throw new Error("Login succeeded but no JWT token was returned.");
      }

      if (role !== "ADMIN") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");

        setError(
          "This account does not have administrator access. Please use the normal user login."
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("jwt", token);

      // Helpful for existing ESM frontend code that checks the role separately.
      localStorage.setItem("role", "ADMIN");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      const status = err?.response?.status;
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (status === 401) {
        setError("Invalid administrator username or password.");
      } else if (status === 403) {
        setError("You do not have administrator permission.");
      } else {
        setError(
          backendMessage || "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = () => {
    navigate("/login");
  };

  return (
    <Box className="auth-page">
      <Container maxWidth="sm">
        <Card className="auth-card">
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Stack spacing={1} alignItems="center">
                  <EsmLogo variant="admin" />
                  <Typography variant="h4" fontWeight={800}>
                    Admin Login
                  </Typography>
                  <Typography color="text.secondary" align="center">
                    Manage your Scrum workspace and delivery flow.
                  </Typography>
                </Stack>

                {error && (
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    <Login />
                  }
                  sx={{
                    minHeight: 48,
                    fontWeight: 700,
                  }}
                >
                  {loading ? "Signing in..." : "Sign in as Admin"}
                </Button>

                <Typography align="center">
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={handleUserLogin}
                  >
                    Login as Normal User
                  </Link>
                </Typography>
              </Stack>
            </form>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
              sx={{ mt: 3 }}
            >
              Authorized administrators only
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLoginPage;