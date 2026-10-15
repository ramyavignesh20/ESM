import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DeleteOutline, Send } from "@mui/icons-material";
import PageHeader from "../components/PageHeader";
import {
  deleteChatMessage,
  getChatMessages,
  sendChatMessage,
} from "../api/collaborationApi";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const isAdmin = localStorage.getItem("role") === "ADMIN";
  let currentUserId = null;
  if (!isAdmin) {
    try {
      currentUserId = JSON.parse(localStorage.getItem("user") || "null")?.userId;
    } catch {
      currentUserId = null;
    }
  }

  const loadMessages = useCallback(async () => {
    try {
      const result = await getChatMessages();
      setMessages(Array.isArray(result) ? result : []);
      setError("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load the team chat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const refresh = window.setInterval(loadMessages, 8000);
    return () => window.clearInterval(refresh);
  }, [loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = content.trim();
    if (!message || sending) return;

    setSending(true);
    setError("");
    try {
      const sent = await sendChatMessage(message);
      setMessages((current) => [...current, sent].slice(-100));
      setContent("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete || deleting) return;

    setDeleting(true);
    setError("");
    try {
      await deleteChatMessage(messageToDelete.id);
      setMessages((current) =>
        current.filter((message) => message.id !== messageToDelete.id)
      );
      setMessageToDelete(null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to delete the message."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Team chat"
        subtitle="A shared conversation for administrators and team members."
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack
            spacing={1.5}
            sx={{
              height: { xs: "55vh", md: "60vh" },
              minHeight: 360,
              overflowY: "auto",
              pb: 1,
            }}
          >
            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ display: "grid", placeItems: "center", flex: 1 }}>
                <Typography color="text.secondary">
                  No messages yet. Start the conversation.
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Stack
                  key={message.id}
                  direction="row"
                  spacing={1.25}
                  alignItems="flex-start"
                  sx={{ maxWidth: "90%" }}
                >
                  <Avatar sx={{ width: 34, height: 34 }}>
                    {message.senderName?.[0] || "?"}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                      <Typography variant="body2" fontWeight={700}>
                        {message.senderName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.senderRole}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.sentAt
                          ? new Date(message.sentAt).toLocaleString()
                          : ""}
                      </Typography>
                      {(isAdmin ||
                        Number(currentUserId) === Number(message.senderId)) && (
                        <Tooltip title="Delete message">
                          <span>
                            <IconButton
                              size="small"
                              aria-label={`Delete message from ${message.senderName}`}
                              onClick={() => setMessageToDelete(message)}
                              disabled={deleting}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Box>
                  </Box>
                </Stack>
              ))
            )}
            <div ref={endRef} />
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Box component="form" onSubmit={handleSend}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                multiline
                maxRows={4}
                label="Message"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                inputProps={{ maxLength: 2000 }}
                disabled={sending}
              />
              <Button
                type="submit"
                variant="contained"
                aria-label="Send message"
                disabled={sending || !content.trim()}
                sx={{ minWidth: 48, alignSelf: "flex-end" }}
              >
                <Send />
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(messageToDelete)}
        onClose={() => {
          if (!deleting) setMessageToDelete(null);
        }}
        aria-labelledby="delete-message-title"
      >
        <DialogTitle id="delete-message-title">Delete message?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This message will be permanently removed from the team chat.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMessageToDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
