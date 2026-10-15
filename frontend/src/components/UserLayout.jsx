import React, { useEffect, useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  Dashboard,
  Settings,
  Logout,
  DarkMode,
  LightMode,
  NotificationsActive,
  Forum,
} from "@mui/icons-material";

import {
  Outlet,
  useNavigate,
} from "react-router-dom";

import { getCurrentUser } from "../api/userApi";

// Footer
import Footer from "./Footer";

export default function UserLayout({
  darkMode,
  toggleTheme,
}) {
  const navigate = useNavigate();

  // ======================================================
  // USER PROFILE
  // ======================================================

  const [profile, setProfile] = useState(() => ({
    fullName:
      localStorage.getItem("fullName") || "",

    profileLogo:
      localStorage.getItem("profileLogo") || "",
  }));

  // ======================================================
  // LOAD CURRENT USER
  // ======================================================

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setProfile(user);

        localStorage.setItem(
          "fullName",
          user.fullName || ""
        );

        localStorage.setItem(
          "profileLogo",
          user.profileLogo || ""
        );
      })
      .catch(() => {});
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    localStorage.clear();

    navigate("/login", {
      replace: true,
    });
  };

  // ======================================================
  // USER LAYOUT
  // ======================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ==================================================
          TOP NAVIGATION BAR
      ================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
      >
        <Toolbar sx={{ gap: 1.5 }}>

          {/* APPLICATION NAME */}

          <Typography
            sx={{
              flexGrow: 1,
              cursor: "pointer",
            }}
            fontWeight={800}
            onClick={() =>
              navigate("/user/dashboard")
            }
          >
            Enterprise Scrum
          </Typography>

          {/* DASHBOARD */}

          <Button
            startIcon={<Dashboard />}
            onClick={() =>
              navigate("/user/dashboard")
            }
          >
            Dashboard
          </Button>

          <Button
            startIcon={<NotificationsActive />}
            onClick={() => navigate("/user/notifications")}
          >
            Notifications
          </Button>

          <Button
            startIcon={<Forum />}
            onClick={() => navigate("/user/chat")}
          >
            Chat
          </Button>

          {/* DARK / LIGHT MODE */}

          <IconButton onClick={toggleTheme}>
            {darkMode ? (
              <LightMode />
            ) : (
              <DarkMode />
            )}
          </IconButton>

          {/* SETTINGS */}

          <IconButton
            onClick={() =>
              navigate("/user/settings")
            }
          >
            <Settings />
          </IconButton>

          {/* LOGOUT */}

          <IconButton onClick={logout}>
            <Logout />
          </IconButton>

          {/* USER PROFILE */}

          <Avatar
            src={
              profile.profileLogo || undefined
            }
            sx={{
              width: 34,
              height: 34,
            }}
          >
            {profile.fullName?.[0] || "U"}
          </Avatar>

        </Toolbar>
      </AppBar>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: {
            xs: 2,
            md: 3,
          },
          pt: 4,
          pb: 4,
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </Box>

      {/* ==================================================
          FOOTER / BOTTOM BAR
      ================================================== */}

      <Footer />
    </Box>
  );
}