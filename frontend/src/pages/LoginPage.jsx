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

import { login } from "../api";
import EsmLogo from "../components/EsmLogo";

export default function LoginPage({ notify }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const submit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Enter username and password.");
      return;
    }

    try {
      setLoading(true);

      console.log("Attempting user login:", form.username);

      const data = await login({
        username: form.username.trim(),
        password: form.password,
      });

      console.log("Login response:", data);

      // ========================================
      // CHECK RESPONSE
      // ========================================

      if (!data) {
        setError("Invalid response from server.");
        return;
      }

      // ========================================
      // ADMIN ACCOUNT
      // ========================================

      if (String(data.role).toUpperCase() === "ADMIN") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("fullName");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setError(
          "Admin account detected. Please use Admin Login."
        );

        return;
      }

      // ========================================
      // TOKEN CHECK
      // ========================================

      if (!data.token) {
        setError("Login succeeded but no JWT token was received.");
        return;
      }

      // ========================================
      // SAVE LOGIN INFORMATION
      // ========================================

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "username",
        data.username || form.username.trim()
      );

      localStorage.setItem(
        "fullName",
        data.fullName || data.username || form.username.trim()
      );

      localStorage.setItem(
        "role",
        String(data.role || "USER").toUpperCase()
      );

      // Optional complete user object
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      console.log("Login successful");
      console.log("Role:", data.role);
      console.log("JWT saved:", !!localStorage.getItem("token"));

      if (notify) {
        notify("Login successful.");
      }

      // ========================================
      // USER DASHBOARD
      // ========================================

      navigate("/user/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Check your username and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box className="auth-page">
      <Container maxWidth="sm">
        <Card className="auth-card">
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <Stack spacing={3}>

              {/* ================================= */}
              {/* HEADER */}
              {/* ================================= */}

              <Stack
                spacing={1}
                alignItems="center"
              >
                <EsmLogo variant="user" />

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  User Login
                </Typography>

                <Typography
                  color="text.secondary"
                  align="center"
                >
                  Access your Scrum workspace and assigned
                  tasks.
                </Typography>
              </Stack>

              {/* ================================= */}
              {/* ERROR */}
              {/* ================================= */}

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {/* ================================= */}
              {/* LOGIN FORM */}
              {/* ================================= */}

              <Box
                component="form"
                onSubmit={submit}
              >
                <Stack spacing={2}>

                  <TextField
                    name="username"
                    label="Username"
                    fullWidth
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <TextField
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Login />}
                    disabled={loading}
                    sx={{
                      minHeight: 48,
                      fontWeight: 700,
                    }}
                  >
                    {loading
                      ? "Signing in..."
                      : "Login"}
                  </Button>

                </Stack>
              </Box>

              {/* ================================= */}
              {/* REGISTER */}
              {/* ================================= */}

              <Typography align="center">
                New user?{" "}

                <Link
                  component="button"
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  underline="hover"
                >
                  Register
                </Link>
              </Typography>

              {/* ================================= */}
              {/* ADMIN LOGIN */}
              {/* ================================= */}

              <Typography
                align="center"
                variant="body2"
              >
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() =>
                    navigate("/admin/login")
                  }
                >
                  Admin Login
                </Link>
              </Typography>

            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
