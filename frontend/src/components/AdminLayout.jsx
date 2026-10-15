import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Dashboard,
  Folder,
  ViewKanban,
  Task,
  ViewColumn,
  Settings,
  People,
  NotificationsActive,
  Forum,
  Menu as MenuIcon,
  Logout,
  DarkMode,
  LightMode,
} from "@mui/icons-material";

import {
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";

// Footer
import Footer from "./Footer";

const drawerWidth = 248;

const items = [
  ["/admin/dashboard", "Dashboard", <Dashboard />],
  ["/admin/projects", "Projects", <Folder />],
  ["/admin/sprints", "Sprints", <ViewKanban />],
  ["/admin/tasks", "Tasks", <Task />],
  ["/admin/notifications", "Notifications", <NotificationsActive />],
  ["/admin/chat", "Team chat", <Forum />],
  ["/admin/users", "Users & Assignees", <People />],
  ["/admin/columns", "Add Column", <ViewColumn />],
  ["/admin/settings", "Settings", <Settings />],
];

export default function AdminLayout({ darkMode, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  // ======================================================
  // SIDEBAR
  // ======================================================

  const drawer = (
    <Box>
      {/* BRAND */}
      <Box className="brand-box">
        <Box className="brand-mark">E</Box>

        <Box>
          <Typography fontWeight={800}>
            Enterprise Scrum
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Management
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* MAIN MENU */}
      <List sx={{ p: 1.25 }}>
        {items.map(([path, label, icon]) => (
          <ListItemButton
            key={path}
            selected={
              location.pathname === path ||
              location.pathname.startsWith(`${path}/`)
            }
            onClick={() => {
              navigate(path);

              if (mobile) {
                setMobileOpen(false);
              }
            }}
            className="nav-item"
          >
            <ListItemIcon>
              {icon}
            </ListItemIcon>

            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* SETTINGS / THEME / LOGOUT */}
      <List sx={{ p: 1.25 }}>
        <ListItemButton
          onClick={toggleTheme}
          className="nav-item"
        >
          <ListItemIcon>
            {darkMode ? <LightMode /> : <DarkMode />}
          </ListItemIcon>

          <ListItemText
            primary={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
          />
        </ListItemButton>

        <ListItemButton
          onClick={logout}
          className="nav-item"
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* ==================================================
          TOP APP BAR
      ================================================== */}

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        className="top-bar"
        sx={{
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
          ml: {
            md: `${drawerWidth}px`,
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
          }}
        >
          {/* MOBILE MENU */}
          {mobile ? (
            <IconButton
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box />
          )}

          {/* ADMIN PROFILE */}
          <Box
            onClick={(e) =>
              setAnchor(e.currentTarget)
            }
            className="admin-profile"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Avatar
              src={
                localStorage.getItem(
                  "profileLogo"
                ) || undefined
              }
              sx={{
                width: 38,
                height: 38,
              }}
            >
              {localStorage.getItem(
                "fullName"
              )?.[0] || "A"}
            </Avatar>

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Typography fontWeight={700}>
                Administrator
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                ADMIN
              </Typography>
            </Box>
          </Box>

          {/* PROFILE MENU */}
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
          >
            <MenuItem
              onClick={() =>
                navigate("/admin/settings")
              }
            >
              Profile & Settings
            </MenuItem>

            <MenuItem onClick={logout}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        {mobile ? (
          <Drawer
            open={mobileOpen}
            onClose={() =>
              setMobileOpen(false)
            }
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* ==================================================
          MAIN CONTENT + FOOTER
      ================================================== */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,

          display: "flex",
          flexDirection: "column",

          minHeight: "100vh",

          px: {
            xs: 2,
            md: 3.5,
          },

          pt: 11,
        }}
      >
        {/* PAGE CONTENT */}

        <Box
          sx={{
            flex: 1,
            pb: 4,
          }}
        >
          <Outlet />
        </Box>

        {/* ==================================================
            BOTTOM BAR / FOOTER
        ================================================== */}

        <Footer />
      </Box>
    </Box>
  );
}