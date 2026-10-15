import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    CheckCircle,
    Delete,
    Edit,
    Lightbulb,
    Refresh,
    Save,
    SentimentDissatisfied,
    SentimentSatisfied,
    Warning,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";
import { getSprintById } from "../api";

const EMPTY_FORM = {
    wentWell: "",
    improve: "",
    action: "",
};

const STORAGE_PREFIX = "esm_sprint_retro_";

function normalizeResponse(response) {
    return response?.data ?? response;
}

function getSprintStatusColor(status) {
    const value = String(status || "").toUpperCase();

    if (value === "COMPLETED") return "success";
    if (value === "ACTIVE") return "primary";
    if (value === "IN_PROGRESS") return "primary";
    if (value === "CANCELLED") return "error";

    return "default";
}

function SprintRetroPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sprint, setSprint] = useState(null);

    const [wentWell, setWentWell] = useState([]);
    const [improve, setImprove] = useState([]);
    const [actions, setActions] = useState([]);

    const [form, setForm] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingItem, setEditingItem] = useState(null);

    const storageKey = useMemo(
        () => `${STORAGE_PREFIX}${id}`,
        [id]
    );

    // ---------------------------------------------------------
    // LOAD SPRINT
    // ---------------------------------------------------------
    useEffect(() => {
        if (!id) return;

        loadSprint();
        loadRetro();
    }, [id]);

    const loadSprint = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getSprintById(id);
            const data = normalizeResponse(response);

            setSprint(data);
        } catch (err) {
            console.error("FAILED TO LOAD SPRINT:", err);

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to load sprint details."
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // LOAD RETROSPECTIVE FROM LOCAL STORAGE
    // ---------------------------------------------------------
    const loadRetro = () => {
        try {
            const stored = localStorage.getItem(storageKey);

            if (!stored) {
                setWentWell([]);
                setImprove([]);
                setActions([]);
                return;
            }

            const data = JSON.parse(stored);

            setWentWell(Array.isArray(data.wentWell) ? data.wentWell : []);
            setImprove(Array.isArray(data.improve) ? data.improve : []);
            setActions(Array.isArray(data.actions) ? data.actions : []);
        } catch (err) {
            console.error("FAILED TO LOAD RETROSPECTIVE:", err);
        }
    };

    // ---------------------------------------------------------
    // SAVE RETROSPECTIVE
    // ---------------------------------------------------------
    const saveRetro = () => {
        try {
            setSaving(true);
            setSuccess("");
            setError("");

            const data = {
                sprintId: id,
                sprintName: sprint?.name || "",
                wentWell,
                improve,
                actions,
                updatedAt: new Date().toISOString(),
            };

            localStorage.setItem(storageKey, JSON.stringify(data));

            setSuccess("Sprint retrospective saved successfully.");

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error("FAILED TO SAVE RETROSPECTIVE:", err);
            setError("Failed to save retrospective.");
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // FORM CHANGE
    // ---------------------------------------------------------
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ---------------------------------------------------------
    // ADD ITEM
    // ---------------------------------------------------------
    const addItem = (type) => {
        const value =
            type === "wentWell"
                ? form.wentWell.trim()
                : type === "improve"
                    ? form.improve.trim()
                    : form.action.trim();

        if (!value) {
            setError("Please enter some text before adding an item.");
            return;
        }

        const newItem = {
            id: Date.now(),
            text: value,
            createdAt: new Date().toISOString(),
        };

        if (editingItem?.type === type) {
            updateExistingItem(type, editingItem.id, value);

            setEditingItem(null);

            setForm((previous) => ({
                ...previous,
                [type]: "",
            }));

            return;
        }

        if (type === "wentWell") {
            setWentWell((previous) => [...previous, newItem]);
        }

        if (type === "improve") {
            setImprove((previous) => [...previous, newItem]);
        }

        if (type === "action") {
            setActions((previous) => [...previous, newItem]);
        }

        setForm((previous) => ({
            ...previous,
            [type]: "",
        }));

        setError("");
    };

    // ---------------------------------------------------------
    // UPDATE ITEM
    // ---------------------------------------------------------
    const updateExistingItem = (type, itemId, newText) => {
        const updateList = (list) =>
            list.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        text: newText,
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            );

        if (type === "wentWell") {
            setWentWell(updateList);
        }

        if (type === "improve") {
            setImprove(updateList);
        }

        if (type === "action") {
            setActions(updateList);
        }
    };

    // ---------------------------------------------------------
    // DELETE ITEM
    // ---------------------------------------------------------
    const deleteItem = (type, itemId) => {
        if (type === "wentWell") {
            setWentWell((previous) =>
                previous.filter((item) => item.id !== itemId)
            );
        }

        if (type === "improve") {
            setImprove((previous) =>
                previous.filter((item) => item.id !== itemId)
            );
        }

        if (type === "action") {
            setActions((previous) =>
                previous.filter((item) => item.id !== itemId)
            );
        }
    };

    // ---------------------------------------------------------
    // EDIT ITEM
    // ---------------------------------------------------------
    const editItem = (type, item) => {
        setEditingItem({
            type,
            id: item.id,
        });

        setForm((previous) => ({
            ...previous,
            [type]: item.text,
        }));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ---------------------------------------------------------
    // CANCEL EDIT
    // ---------------------------------------------------------
    const cancelEdit = () => {
        setEditingItem(null);

        setForm((previous) => ({
            ...previous,
            wentWell: "",
            improve: "",
            action: "",
        }));
    };

    // ---------------------------------------------------------
    // CLEAR RETROSPECTIVE
    // ---------------------------------------------------------
    const clearRetro = () => {
        if (
            !window.confirm(
                "Are you sure you want to clear this sprint retrospective?"
            )
        ) {
            return;
        }

        setWentWell([]);
        setImprove([]);
        setActions([]);

        localStorage.removeItem(storageKey);

        setSuccess("Retrospective cleared.");

        setTimeout(() => {
            setSuccess("");
        }, 2500);
    };

    // ---------------------------------------------------------
    // KEYBOARD SUPPORT
    // ---------------------------------------------------------
    const handleKeyDown = (event, type) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            addItem(type);
        }
    };

    const totalItems =
        wentWell.length +
        improve.length +
        actions.length;

    // ---------------------------------------------------------
    // ITEM LIST
    // ---------------------------------------------------------
    const ItemList = ({
        items,
        type,
        emptyMessage,
    }) => {
        if (!items.length) {
            return (
                <Box
                    sx={{
                        py: 3,
                        textAlign: "center",
                        color: "text.secondary",
                    }}
                >
                    <Typography variant="body2">
                        {emptyMessage}
                    </Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={1.5}>
                {items.map((item, index) => (
                    <Paper
                        key={item.id}
                        elevation={0}
                        sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                        >
                            <Chip
                                label={index + 1}
                                size="small"
                                sx={{
                                    minWidth: 30,
                                }}
                            />

                            <Typography
                                variant="body2"
                                sx={{
                                    flex: 1,
                                    pt: 0.5,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                }}
                            >
                                {item.text}
                            </Typography>

                            <IconButton
                                size="small"
                                onClick={() => editItem(type, item)}
                                title="Edit"
                            >
                                <Edit fontSize="small" />
                            </IconButton>

                            <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                    deleteItem(type, item.id)
                                }
                                title="Delete"
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    };

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------
    if (loading) {
        return (
            <Box
                sx={{
                    p: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                }}
            >
                <Typography>
                    Loading sprint retrospective...
                </Typography>
            </Box>
        );
    }

    // ---------------------------------------------------------
    // ERROR / NO SPRINT
    // ---------------------------------------------------------
    if (!sprint) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || "Sprint could not be loaded."}
                </Alert>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={loadSprint}
                    >
                        Retry
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </Button>
                </Stack>
            </Box>
        );
    }

    // ---------------------------------------------------------
    // MAIN UI
    // ---------------------------------------------------------
    return (
        <Box
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },
                maxWidth: 1500,
                mx: "auto",
            }}
        >
            {/* HEADER */}
            <Stack
                direction={{
                    xs: "column",
                    md: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    md: "center",
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 1 }}
                    >
                        Back
                    </Button>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Sprint Retrospective
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Review the sprint, identify improvements,
                        and define action items.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => {
                            loadSprint();
                            loadRetro();
                        }}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={saveRetro}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Retro"}
                    </Button>
                </Stack>
            </Stack>

            {/* ALERTS */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>
            )}

            {/* SPRINT INFORMATION */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {sprint.name || `Sprint ${id}`}
                            </Typography>

                            {sprint.goal && (
                                <Typography
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                >
                                    {sprint.goal}
                                </Typography>
                            )}
                        </Box>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Chip
                                label={sprint.status || "PLANNED"}
                                color={getSprintStatusColor(
                                    sprint.status
                                )}
                            />

                            <Chip
                                label={`${totalItems} review items`}
                                variant="outlined"
                            />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Start Date
                            </Typography>

                            <Typography fontWeight={600}>
                                {sprint.startDate || "-"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                End Date
                            </Typography>

                            <Typography fontWeight={600}>
                                {sprint.endDate || "-"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Sprint ID
                            </Typography>

                            <Typography fontWeight={600}>
                                #{sprint.id || id}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* RETRO COLUMNS */}
            <Grid container spacing={3}>
                {/* WHAT WENT WELL */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            height: "100%",
                            borderTop: "4px solid",
                            borderColor: "success.main",
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <SentimentSatisfied color="success" />

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    What Went Well
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Things that worked well during the
                                sprint.
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                name="wentWell"
                                value={form.wentWell}
                                onChange={handleChange}
                                onKeyDown={(event) =>
                                    handleKeyDown(
                                        event,
                                        "wentWell"
                                    )
                                }
                                placeholder="Example: Team completed the planned stories..."
                                sx={{ mb: 1.5 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={
                                    editingItem?.type ===
                                    "wentWell"
                                        ? <Edit />
                                        : <CheckCircle />
                                }
                                onClick={() =>
                                    addItem("wentWell")
                                }
                            >
                                {editingItem?.type ===
                                "wentWell"
                                    ? "Update"
                                    : "Add Item"}
                            </Button>

                            {editingItem?.type ===
                                "wentWell" && (
                                    <Button
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={cancelEdit}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}

                            <Divider sx={{ my: 2 }} />

                            <ItemList
                                items={wentWell}
                                type="wentWell"
                                emptyMessage="No positive points added yet."
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* NEEDS IMPROVEMENT */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            height: "100%",
                            borderTop: "4px solid",
                            borderColor: "warning.main",
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <SentimentDissatisfied color="warning" />

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Needs Improvement
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Problems, blockers, or areas that
                                could be improved.
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                name="improve"
                                value={form.improve}
                                onChange={handleChange}
                                onKeyDown={(event) =>
                                    handleKeyDown(
                                        event,
                                        "improve"
                                    )
                                }
                                placeholder="Example: Code review took longer than expected..."
                                sx={{ mb: 1.5 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                startIcon={
                                    editingItem?.type ===
                                    "improve"
                                        ? <Edit />
                                        : <Warning />
                                }
                                onClick={() =>
                                    addItem("improve")
                                }
                            >
                                {editingItem?.type ===
                                "improve"
                                    ? "Update"
                                    : "Add Item"}
                            </Button>

                            {editingItem?.type ===
                                "improve" && (
                                    <Button
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={cancelEdit}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}

                            <Divider sx={{ my: 2 }} />

                            <ItemList
                                items={improve}
                                type="improve"
                                emptyMessage="No improvement points added yet."
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* ACTION ITEMS */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            height: "100%",
                            borderTop: "4px solid",
                            borderColor: "primary.main",
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <Lightbulb color="primary" />

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Action Items
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Actions the team should take in the
                                next sprint.
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                name="action"
                                value={form.action}
                                onChange={handleChange}
                                onKeyDown={(event) =>
                                    handleKeyDown(
                                        event,
                                        "action"
                                    )
                                }
                                placeholder="Example: Add automated tests for critical APIs..."
                                sx={{ mb: 1.5 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    editingItem?.type ===
                                    "action"
                                        ? <Edit />
                                        : <Lightbulb />
                                }
                                onClick={() =>
                                    addItem("action")
                                }
                            >
                                {editingItem?.type ===
                                "action"
                                    ? "Update"
                                    : "Add Action"}
                            </Button>

                            {editingItem?.type ===
                                "action" && (
                                    <Button
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={cancelEdit}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}

                            <Divider sx={{ my: 2 }} />

                            <ItemList
                                items={actions}
                                type="action"
                                emptyMessage="No action items added yet."
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* BOTTOM ACTIONS */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "stretch",
                            sm: "center",
                        }}
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Retrospective Summary
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {wentWell.length} positive point
                                {wentWell.length !== 1 ? "s" : ""},{" "}
                                {improve.length} improvement point
                                {improve.length !== 1 ? "s" : ""},{" "}
                                {actions.length} action item
                                {actions.length !== 1 ? "s" : ""}.
                            </Typography>
                        </Box>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={1}
                        >
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={clearRetro}
                            >
                                Clear Retrospective
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={saveRetro}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Retrospective"}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default SprintRetroPage;