import React, {
  lazy,
  Suspense,
  useMemo,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";

import {
  Alert,
  Box,
  CssBaseline,
  Snackbar,
} from "@mui/material";

// ======================================================
// PUBLIC PAGES
// ======================================================

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";

// ======================================================
// LAZY LOADED PAGES
// ======================================================

const UserDashboard = lazy(
  () => import("./pages/UserDashboard")
);

const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard")
);

const ProjectsPage = lazy(
  () => import("./pages/ProjectsPage")
);

const SprintsPage = lazy(
  () => import("./pages/SprintsPage")
);

const SprintPlanningPage = lazy(
  () => import("./pages/SprintPlanningPage")
);

const SprintProcessPage = lazy(
  () => import("./pages/SprintProcessPage")
);

const SprintBoardPage = lazy(
  () => import("./pages/SprintBoardPage")
);

const SprintReviewPage = lazy(
  () => import("./pages/SprintReviewPage")
);

const SprintRetroPage = lazy(
  () => import("./pages/SprintRetroPage")
);

const TasksPage = lazy(
  () => import("./pages/TasksPage")
);

const ColumnsPage = lazy(
  () => import("./pages/ColumnsPage")
);

const SettingsPage = lazy(
  () => import("./pages/SettingsPage")
);

const UsersPage = lazy(
  () => import("./pages/UsersPage")
);

const NotificationsPage = lazy(
  () => import("./pages/NotificationsPage")
);

const ChatPage = lazy(
  () => import("./pages/ChatPage")
);

// ======================================================
// LAYOUTS
// ======================================================

import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";

// ======================================================
// PRIVATE ROUTE
// ======================================================

function PrivateRoute({
  children,
  role,
}) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  console.log("PrivateRoute:", {
    tokenExists: !!token,
    userRole,
    requiredRole: role,
  });

  // No JWT token
  if (!token) {
    return (
      <Navigate
        to={
          role === "ADMIN"
            ? "/admin/login"
            : "/login"
        }
        replace
      />
    );
  }

  // Wrong role
  if (
    role &&
    userRole !== role
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

// ======================================================
// APP
// ======================================================

export default function App() {
  // ====================================================
  // DARK MODE
  // ====================================================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // ====================================================
  // NOTIFICATION
  // ====================================================

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ====================================================
  // THEME
  // ====================================================

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode
            ? "dark"
            : "light",

          primary: {
            main: darkMode ? "#f5f5f5" : "#212121",
            light: darkMode ? "#ffffff" : "#424242",
            dark: darkMode ? "#bdbdbd" : "#000000",
          },

          secondary: {
            main: darkMode ? "#bdbdbd" : "#616161",
            light: darkMode ? "#e0e0e0" : "#9e9e9e",
            dark: darkMode ? "#757575" : "#424242",
          },

          background: {
            default: darkMode
              ? "#121212"
              : "#f5f5f5",

            paper: darkMode
              ? "#1e1e1e"
              : "#ffffff",
          },

          text: {
            primary: darkMode
              ? "#f5f5f5"
              : "#212121",

            secondary: darkMode
              ? "#bdbdbd"
              : "#616161",
          },
        },

        shape: {
          borderRadius: 12,
        },

        typography: {
          fontFamily:
            "Inter, Roboto, Arial, sans-serif",
        },

        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 700,
              },
            },
          },

          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                backgroundColor: darkMode ? "#212121" : "#424242",
                color: "#ffffff",
              },
            },
          },

          MuiLinearProgress: {
            styleOverrides: {
              bar: {
                backgroundColor: darkMode ? "#bdbdbd" : "#424242",
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // ====================================================
  // NOTIFICATION FUNCTION
  // ====================================================

  const notify = (
    message,
    severity = "success"
  ) => {
    setSnack({
      open: true,
      message,
      severity,
    });
  };

  // ====================================================
  // THEME TOGGLE
  // ====================================================

  const toggleTheme = () => {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem(
      "theme",
      next ? "dark" : "light"
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Suspense
        fallback={
          <Box
            sx={{
              minHeight: "60vh",
              display: "grid",
              placeItems: "center",
            }}
          >
            Loading workspace...
          </Box>
        }
      >

        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={
              <LoginPage
                notify={notify}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage
                notify={notify}
              />
            }
          />

          <Route
            path="/admin/login"
            element={
              <AdminLoginPage
                notify={notify}
              />
            }
          />

          {/* ==================================================
              USER ROUTES
              Footer is inside UserLayout
          ================================================== */}

          <Route
            element={
              <PrivateRoute role="USER">
                <UserLayout
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                />
              </PrivateRoute>
            }
          >

            <Route
              path="/user/dashboard"
              element={
                <UserDashboard />
              }
            />

            <Route
              path="/user/notifications"
              element={<NotificationsPage />}
            />

            <Route
              path="/user/chat"
              element={<ChatPage />}
            />

            <Route
              path="/user/settings"
              element={
                <SettingsPage
                  notify={notify}
                  toggleTheme={toggleTheme}
                />
              }
            />

          </Route>

          {/* ==================================================
              ADMIN ROUTES
              Footer is inside AdminLayout
          ================================================== */}

          <Route
            element={
              <PrivateRoute role="ADMIN">
                <AdminLayout
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                />
              </PrivateRoute>
            }
          >

            {/* ADMIN DASHBOARD */}

            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboard />
              }
            />

            <Route
              path="/admin/notifications"
              element={<NotificationsPage />}
            />

            <Route
              path="/admin/chat"
              element={<ChatPage />}
            />

            {/* PROJECTS */}

            <Route
              path="/admin/projects"
              element={
                <ProjectsPage
                  notify={notify}
                />
              }
            />

            {/* PROJECT PROCESS */}

            <Route
              path="/admin/projects/:projectId/process"
              element={
                <SprintProcessPage />
              }
            />

            {/* PROJECT TASKS */}

            <Route
              path="/admin/projects/:projectId/tasks"
              element={
                <TasksPage
                  notify={notify}
                />
              }
            />

            {/* PROJECT COLUMNS */}

            <Route
              path="/admin/projects/:projectId/columns"
              element={
                <ColumnsPage
                  notify={notify}
                />
              }
            />

            {/* SPRINTS */}

            <Route
              path="/admin/sprints"
              element={
                <SprintsPage
                  notify={notify}
                />
              }
            />

            {/* SPRINT PLANNING */}

            <Route
              path="/admin/sprints/:id/planning"
              element={
                <SprintPlanningPage />
              }
            />

            {/* SPRINT BOARD */}

            <Route
              path="/admin/sprints/:id/board"
              element={
                <SprintBoardPage />
              }
            />

            {/* SPRINT REVIEW */}

            <Route
              path="/admin/sprints/:id/review"
              element={
                <SprintReviewPage
                  notify={notify}
                />
              }
            />

            {/* SPRINT RETROSPECTIVE */}

            <Route
              path="/admin/sprints/:id/retro"
              element={
                <SprintRetroPage
                  notify={notify}
                />
              }
            />

            {/* ADMIN TASKS */}

            <Route
              path="/admin/tasks"
              element={
                <TasksPage
                  notify={notify}
                />
              }
            />

            {/* USERS */}

            <Route
              path="/admin/users"
              element={
                <UsersPage
                  notify={notify}
                />
              }
            />

            {/* COLUMNS */}

            <Route
              path="/admin/columns"
              element={
                <ColumnsPage
                  notify={notify}
                />
              }
            />

            {/* ADMIN SETTINGS */}

            <Route
              path="/admin/settings"
              element={
                <SettingsPage
                  notify={notify}
                  toggleTheme={toggleTheme}
                  isAdmin
                />
              }
            />

          </Route>

          {/* ==================================================
              UNKNOWN URL
          ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </Suspense>

      {/* ==================================================
          GLOBAL SNACKBAR
      ================================================== */}

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnack((s) => ({
            ...s,
            open: false,
          }))
        }
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() =>
            setSnack((s) => ({
              ...s,
              open: false,
            }))
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>

    </ThemeProvider>
  );
}