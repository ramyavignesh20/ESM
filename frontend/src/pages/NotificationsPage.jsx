import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  MarkEmailRead,
  NotificationsActive,
} from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import {
  getNotifications,
  markNotificationRead,
} from "../api/collaborationApi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setError("");
      const result = await getNotifications();
      setNotifications(Array.isArray(result) ? result : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load your notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notification) => {
    try {
      await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to update this notification."
      );
    }
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Task assignments and updates for your account."
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <NotificationsActive color="action" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h6">You&apos;re all caught up</Typography>
            <Typography color="text.secondary">
              New task assignments will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              variant="outlined"
              sx={{
                borderColor: notification.read ? "divider" : "primary.main",
                opacity: notification.read ? 0.78 : 1,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                    <Typography fontWeight={700}>
                      {notification.message}
                    </Typography>
                    {!notification.read && <Chip size="small" color="primary" label="New" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </Typography>
                  {notification.type === "TASK_ASSIGNED" && (
                    <Typography variant="caption" color="text.secondary">
                      {notification.emailSent
                        ? "Assignment email sent"
                        : "In-app notice saved; email delivery failed. Check backend mail settings."}
                    </Typography>
                  )}
                </Box>
                {!notification.read && (
                  <Button
                    size="small"
                    startIcon={<MarkEmailRead />}
                    onClick={() => handleMarkRead(notification)}
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
