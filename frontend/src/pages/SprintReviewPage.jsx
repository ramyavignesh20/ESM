import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    Assignment,
    CheckCircle,
    ErrorOutline,
    PendingActions,
    Refresh,
    RateReview,
    TaskAlt,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

import {
    getSprintById,
    getSprintTasks,
} from "../api";

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const normalizeResponse = (response) => {
    return response?.data ?? response;
};

const getTaskStatus = (task) => {
    if (!task) return "UNKNOWN";

    if (task.columnState?.name) {
        return String(task.columnState.name).toUpperCase();
    }

    if (task.column?.name) {
        return String(task.column.name).toUpperCase();
    }

    if (task.status) {
        return String(task.status).toUpperCase();
    }

    if (task.columnState) {
        return String(task.columnState).toUpperCase();
    }

    return "UNKNOWN";
};

const getTaskTitle = (task) => {
    return (
        task?.title ||
        task?.name ||
        task?.taskName ||
        `Task #${task?.id || ""}`
    );
};

const getTaskKey = (task) => {
    return (
        task?.taskKey ||
        task?.key ||
        (task?.id ? `TASK-${task.id}` : "TASK")
    );
};

const getAssigneeName = (task) => {
    if (task?.assignee?.name) {
        return task.assignee.name;
    }

    if (task?.assignee?.username) {
        return task.assignee.username;
    }

    if (task?.assignee?.email) {
        return task.assignee.email;
    }

    if (task?.assigneeName) {
        return task.assigneeName;
    }

    return "Unassigned";
};

const getPriorityColor = (priority) => {
    switch (String(priority || "").toUpperCase()) {
        case "HIGH":
        case "URGENT":
        case "CRITICAL":
            return "error";

        case "MEDIUM":
            return "warning";

        case "LOW":
            return "success";

        default:
            return "default";
    }
};

const isCompletedTask = (task) => {
    const status = getTaskStatus(task);

    return [
        "DONE",
        "COMPLETED",
        "CLOSED",
        "UAT",
        "PRODUCTION",
    ].includes(status);
};

const formatDate = (date) => {
    if (!date) return "-";

    try {
        return new Date(date).toLocaleDateString();
    } catch {
        return date;
    }
};

// ---------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------

function SprintReviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sprint, setSprint] = useState(null);
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ---------------------------------------------------------
    // LOAD DATA
    // ---------------------------------------------------------

    useEffect(() => {
        if (!id) return;

        loadReviewData();
    }, [id]);

    const loadReviewData = async () => {
        try {
            setLoading(true);
            setError("");

            // Load sprint details
            const sprintResponse = await getSprintById(id);

            const sprintData = normalizeResponse(
                sprintResponse
            );

            setSprint(sprintData);

            // Load only this sprint's tasks.
            const taskResponse = await getSprintTasks(id);

            const taskData = normalizeResponse(taskResponse);

            if (Array.isArray(taskData)) {
                setTasks(taskData);
            } else if (Array.isArray(taskData?.content)) {
                setTasks(taskData.content);
            } else if (Array.isArray(taskData?.tasks)) {
                setTasks(taskData.tasks);
            } else {
                setTasks([]);
            }
        } catch (err) {
            console.error(
                "FAILED TO LOAD SPRINT REVIEW:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to load sprint review."
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // CALCULATIONS
    // ---------------------------------------------------------

    const completedTasks = useMemo(() => {
        return tasks.filter(isCompletedTask);
    }, [tasks]);

    const incompleteTasks = useMemo(() => {
        return tasks.filter(
            (task) => !isCompletedTask(task)
        );
    }, [tasks]);

    const totalTasks = tasks.length;

    const completionPercentage = useMemo(() => {
        if (totalTasks === 0) return 0;

        return Math.round(
            (completedTasks.length / totalTasks) * 100
        );
    }, [completedTasks.length, totalTasks]);

    const highPriorityTasks = useMemo(() => {
        return tasks.filter((task) => {
            const priority = String(
                task?.priority || ""
            ).toUpperCase();

            return [
                "HIGH",
                "URGENT",
                "CRITICAL",
            ].includes(priority);
        });
    }, [tasks]);

    // ---------------------------------------------------------
    // SPRINT STATUS
    // ---------------------------------------------------------

    const sprintStatus = String(
        sprint?.status || "PLANNED"
    ).toUpperCase();

    const sprintStatusColor =
        sprintStatus === "COMPLETED"
            ? "success"
            : sprintStatus === "ACTIVE" ||
                sprintStatus === "IN_PROGRESS"
                ? "primary"
                : sprintStatus === "CANCELLED"
                    ? "error"
                    : "default";

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <CircularProgress />

                <Typography color="text.secondary">
                    Loading sprint review...
                </Typography>
            </Box>
        );
    }

    // ---------------------------------------------------------
    // ERROR
    // ---------------------------------------------------------

    if (!sprint) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error || "Sprint could not be loaded."}
                </Alert>

                <Stack
                    direction="row"
                    spacing={2}
                >
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={loadReviewData}
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
            {/* =================================================
                HEADER
            ================================================= */}

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

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Typography
                            variant="h4"
                            fontWeight={700}
                        >
                            Sprint Review
                        </Typography>

                        <Chip
                            label={sprintStatus}
                            color={sprintStatusColor}
                            size="small"
                        />
                    </Stack>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Review sprint progress, completed work,
                        and outstanding tasks.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={loadReviewData}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<RateReview />}
                        onClick={() =>
                            navigate(
                                `/admin/sprints/${id}/retro`
                            )
                        }
                    >
                        Sprint Retrospective
                    </Button>
                </Stack>
            </Stack>

            {/* =================================================
                ERROR ALERT
            ================================================= */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* =================================================
                SPRINT INFORMATION
            ================================================= */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        justifyContent="space-between"
                        spacing={3}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {sprint.name ||
                                    `Sprint ${id}`}
                            </Typography>

                            {sprint.goal && (
                                <Typography
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    Sprint Goal:{" "}
                                    {sprint.goal}
                                </Typography>
                            )}
                        </Box>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                        >
                            <Chip
                                label={`#${sprint.id || id}`}
                                variant="outlined"
                            />

                            <Chip
                                label={`${totalTasks} Tasks`}
                                variant="outlined"
                            />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Start Date
                            </Typography>

                            <Typography fontWeight={600}>
                                {formatDate(
                                    sprint.startDate
                                )}
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
                                {formatDate(
                                    sprint.endDate
                                )}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Status
                            </Typography>

                            <Box sx={{ mt: 0.5 }}>
                                <Chip
                                    label={sprintStatus}
                                    color={
                                        sprintStatusColor
                                    }
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
            >
                {/* TOTAL */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "action.hover",
                                    }}
                                >
                                    <Assignment />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Tasks
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                    >
                                        {totalTasks}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* COMPLETED */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "success.light",
                                    }}
                                >
                                    <CheckCircle color="success" />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Completed
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                    >
                                        {completedTasks.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* REMAINING */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "warning.light",
                                    }}
                                >
                                    <PendingActions color="warning" />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Remaining
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                    >
                                        {incompleteTasks.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* HIGH PRIORITY */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "error.light",
                                    }}
                                >
                                    <ErrorOutline color="error" />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        High Priority
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                    >
                                        {highPriorityTasks.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* =================================================
                COMPLETION PROGRESS
            ================================================= */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ mb: 1 }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Sprint Completion
                        </Typography>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {completionPercentage}%
                        </Typography>
                    </Stack>

                    <LinearProgress
                        variant="determinate"
                        value={completionPercentage}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                        }}
                    />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {completedTasks.length} of{" "}
                        {totalTasks} tasks completed.
                    </Typography>
                </CardContent>
            </Card>

            {/* =================================================
                TASK REVIEW
            ================================================= */}

            <Card>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                        sx={{ mb: 2 }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Sprint Work Review
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Review all tasks delivered or
                                remaining in this sprint.
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={() =>
                                navigate(
                                    `/admin/sprints/${id}/board`
                                )
                            }
                            startIcon={<TaskAlt />}
                        >
                            Open Sprint Board
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {tasks.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                textAlign: "center",
                                border: "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius: 2,
                            }}
                        >
                            <Assignment
                                sx={{
                                    fontSize: 50,
                                    color:
                                        "text.secondary",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={600}
                            >
                                No tasks found
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                There are currently no tasks
                                assigned to this sprint.
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() =>
                                    navigate(
                                        `/admin/sprints/${id}/planning`
                                    )
                                }
                            >
                                Open Sprint Planning
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={1.5}>
                            {tasks.map((task) => {
                                const completed =
                                    isCompletedTask(task);

                                return (
                                    <Paper
                                        key={
                                            task.id ||
                                            task.taskKey
                                        }
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: "1px solid",
                                            borderColor:
                                                "divider",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Stack
                                            direction={{
                                                xs: "column",
                                                sm: "row",
                                            }}
                                            justifyContent="space-between"
                                            spacing={2}
                                        >
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {getTaskKey(
                                                            task
                                                        )}
                                                    </Typography>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            completed
                                                                ? "Completed"
                                                                : "Remaining"
                                                        }
                                                        color={
                                                            completed
                                                                ? "success"
                                                                : "warning"
                                                        }
                                                        icon={
                                                            completed ? (
                                                                <CheckCircle />
                                                            ) : (
                                                                <PendingActions />
                                                            )
                                                        }
                                                    />

                                                    {task.priority && (
                                                        <Chip
                                                            size="small"
                                                            label={String(
                                                                task.priority
                                                            )}
                                                            color={getPriorityColor(
                                                                task.priority
                                                            )}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Stack>

                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    sx={{
                                                        mt: 0.75,
                                                        wordBreak:
                                                            "break-word",
                                                    }}
                                                >
                                                    {getTaskTitle(
                                                        task
                                                    )}
                                                </Typography>

                                                {task.description && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {task.description}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack
                                                direction={{
                                                    xs: "row",
                                                    sm: "column",
                                                }}
                                                spacing={1}
                                                alignItems={{
                                                    xs: "center",
                                                    sm: "flex-end",
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    label={getTaskStatus(
                                                        task
                                                    )}
                                                    variant="outlined"
                                                />

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {getAssigneeName(
                                                        task
                                                    )}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* =================================================
                REVIEW ACTIONS
            ================================================= */}

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Sprint Review Actions
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Assignment />}
                                onClick={() =>
                                    navigate(
                                        `/admin/sprints/${id}/planning`
                                    )
                                }
                            >
                                Sprint Planning
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<TaskAlt />}
                                onClick={() =>
                                    navigate(
                                        `/admin/sprints/${id}/board`
                                    )
                                }
                            >
                                Sprint Board
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<RateReview />}
                                onClick={() =>
                                    navigate(
                                        `/admin/sprints/${id}/retro`
                                    )
                                }
                            >
                                Start Retrospective
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}

export default SprintReviewPage;