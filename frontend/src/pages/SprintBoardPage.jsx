import React, { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import {
    getProjects,
    getSprintsByProject,
    getSprintTasks,
    moveTaskToColumn,
} from "../api";
import { getColumns } from "../api/columnApi";

// ======================================================
// SPRINT BOARD PAGE
// ======================================================

const SprintBoardPage = () => {

    // ==================================================
    // STATE
    // ==================================================

    const [projects, setProjects] = useState([]);

    const [selectedProjectId, setSelectedProjectId] =
        useState("");

    const [sprints, setSprints] = useState([]);

    const [selectedSprintId, setSelectedSprintId] =
        useState("");

    const [tasks, setTasks] = useState([]);

    const [columns, setColumns] = useState([]);

    const [projectsLoading, setProjectsLoading] =
        useState(false);

    const [sprintsLoading, setSprintsLoading] =
        useState(false);

    const [tasksLoading, setTasksLoading] =
        useState(false);

    const [columnsLoading, setColumnsLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [movingTaskId, setMovingTaskId] = useState(null);

    // ==================================================
    // LOAD PROJECTS
    // ==================================================

    useEffect(() => {
        loadProjects();
    }, []);

    // ==================================================
    // LOAD SPRINTS WHEN PROJECT CHANGES
    // ==================================================

    useEffect(() => {

        if (!selectedProjectId) {

            setSprints([]);
            setSelectedSprintId("");
            setTasks([]);
            setColumns([]);

            return;
        }

        loadSprints(selectedProjectId);

    }, [selectedProjectId]);

    // ==================================================
    // LOAD TASKS + COLUMNS WHEN SPRINT CHANGES
    // ==================================================

    useEffect(() => {

        if (!selectedSprintId) {

            setTasks([]);

            return;
        }

        loadSprintBoard(
            selectedSprintId
        );

    }, [selectedSprintId]);

    // ==================================================
    // LOAD PROJECTS
    // ==================================================

    const loadProjects = async () => {

        try {

            setProjectsLoading(true);

            setError("");

            console.log(
                "========================================"
            );

            console.log(
                "LOADING PROJECTS"
            );

            console.log(
                "JWT EXISTS:",
                Boolean(
                    localStorage.getItem("token")
                )
            );

            console.log(
                "========================================"
            );

            const response =
                await getProjects();

            // IMPORTANT:
            // getProjects() already returns response.data

            console.log(
                "PROJECT API RESPONSE:",
                response
            );

            const projectList =
                Array.isArray(response)
                    ? response
                    : [];

            setProjects(projectList);

            if (projectList.length === 0) {

                setSelectedProjectId("");
                setSprints([]);
                setSelectedSprintId("");
                setTasks([]);
                setColumns([]);

                return;
            }

            const currentProjectExists =
                projectList.some(
                    (project) =>
                        String(project.id) ===
                        String(selectedProjectId)
                );

            if (!currentProjectExists) {

                const firstProjectId =
                    String(projectList[0].id);

                console.log(
                    "AUTO SELECTING PROJECT:",
                    firstProjectId
                );

                setSelectedProjectId(
                    firstProjectId
                );
            }

            console.log(
                "Projects loaded successfully."
            );

        } catch (err) {

            console.error(
                "FAILED TO LOAD PROJECTS:",
                err
            );

            console.error(
                "HTTP STATUS:",
                err.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );

            setProjects([]);
            setSelectedProjectId("");
            setSprints([]);
            setSelectedSprintId("");
            setTasks([]);
            setColumns([]);

            setError(
                getErrorMessage(
                    err,
                    "Failed to load projects."
                )
            );

        } finally {

            setProjectsLoading(false);
        }
    };

    // ==================================================
    // LOAD SPRINTS
    // ==================================================

    const loadSprints = async (
        projectIdValue
    ) => {

        const projectId =
            Number(projectIdValue);

        if (
            !Number.isInteger(projectId) ||
            projectId <= 0
        ) {

            console.error(
                "INVALID PROJECT ID:",
                projectIdValue
            );

            setSprints([]);
            setSelectedSprintId("");
            setTasks([]);
            setColumns([]);

            return;
        }

        try {

            setSprintsLoading(true);

            setError("");

            console.log(
                "========================================"
            );

            console.log(
                "LOADING SPRINTS"
            );

            console.log(
                "PROJECT ID:",
                projectId
            );

            console.log(
                "JWT EXISTS:",
                Boolean(
                    localStorage.getItem("token")
                )
            );

            console.log(
                "========================================"
            );

            const response =
                await getSprintsByProject(
                    projectId
                );

            // IMPORTANT:
            // getSprintsByProject() already returns response.data

            console.log(
                "SPRINT API RESPONSE:",
                response
            );

            const sprintList =
                Array.isArray(response)
                    ? response
                    : [];

            setSprints(sprintList);

            if (sprintList.length === 0) {

                setSelectedSprintId("");
                setTasks([]);

                return;
            }

            const currentSprintExists =
                sprintList.some(
                    (sprint) =>
                        String(sprint.id) ===
                        String(selectedSprintId)
                );

            if (!currentSprintExists) {

                const activeSprint =
                    sprintList.find(
                        (sprint) =>
                            String(
                                sprint.status
                            ).toUpperCase() ===
                            "ACTIVE"
                    );

                const sprintToSelect =
                    activeSprint ||
                    sprintList[0];

                const sprintId =
                    String(
                        sprintToSelect.id
                    );

                console.log(
                    "AUTO SELECTING SPRINT:",
                    sprintId
                );

                setSelectedSprintId(
                    sprintId
                );
            }

        } catch (err) {

            console.error(
                "FAILED TO LOAD SPRINTS:",
                err
            );

            console.error(
                "SPRINT HTTP STATUS:",
                err.response?.status
            );

            console.error(
                "SPRINT SERVER RESPONSE:",
                err.response?.data
            );

            setSprints([]);
            setSelectedSprintId("");
            setTasks([]);

            if (
                err.response?.status === 401
            ) {

                setError(
                    "Authentication expired. Please login again."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to view sprints."
                );

            } else {

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load sprints."
                    )
                );
            }

        } finally {

            setSprintsLoading(false);
        }
    };

    // ==================================================
    // LOAD SPRINT BOARD
    // ==================================================

    const loadSprintBoard = async (
        sprintIdValue
    ) => {

        const sprintId =
            Number(sprintIdValue);

        if (
            !Number.isInteger(sprintId) ||
            sprintId <= 0
        ) {

            setTasks([]);

            return;
        }

        setTasksLoading(true);
        setColumnsLoading(true);
        setError("");

        console.log(
            "========================================"
        );

        console.log(
            "LOADING SPRINT BOARD"
        );

        console.log(
            "SPRINT ID:",
            sprintId
        );

        console.log(
            "PROJECT ID:",
            selectedProjectId
        );

        console.log(
            "JWT EXISTS:",
            Boolean(
                localStorage.getItem("token")
            )
        );

        console.log(
            "========================================"
        );

        // =================================================
        // LOAD TASKS
        // =================================================

        try {

            console.log(
                "REQUESTING SPRINT TASKS:",
                `/admin/tasks/sprint/${sprintId}`
            );

            const taskResponse =
                await getSprintTasks(
                    sprintId
                );

            // IMPORTANT:
            // getSprintTasks() already returns response.data

            console.log(
                "TASK API RESPONSE:",
                taskResponse
            );

            const taskList =
                Array.isArray(taskResponse)
                    ? taskResponse
                    : [];

            setTasks(taskList);

        } catch (err) {

            console.error(
                "FAILED TO LOAD SPRINT TASKS:",
                err
            );

            console.error(
                "TASK HTTP STATUS:",
                err.response?.status
            );

            console.error(
                "TASK SERVER RESPONSE:",
                err.response?.data
            );

            setTasks([]);

            if (
                err.response?.status === 401
            ) {

                setError(
                    "Authentication expired. Please login again."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to view sprint tasks."
                );

            } else {

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load sprint tasks."
                    )
                );
            }

        } finally {

            setTasksLoading(false);
        }

        // =================================================
        // LOAD COLUMNS
        // =================================================

        const projectId =
            Number(selectedProjectId);

        if (
            !Number.isInteger(projectId) ||
            projectId <= 0
        ) {

            setColumns([]);
            setColumnsLoading(false);

            return;
        }

        try {

            console.log(
                "REQUESTING PROJECT COLUMNS:",
                `/admin/task-columns/project/${projectId}`
            );

            const columnResponse =
                await getColumns(projectId);

            console.log(
                "COLUMN API RESPONSE:",
                columnResponse
            );

            const projectColumns =
                Array.isArray(columnResponse)
                    ? columnResponse
                    : [];

            projectColumns.sort(
                (a, b) =>
                    Number(a.position ?? 0) -
                    Number(b.position ?? 0)
            );

            setColumns(
                projectColumns
            );

        } catch (err) {

            console.error(
                "FAILED TO LOAD COLUMNS:",
                err
            );

            console.error(
                "COLUMN HTTP STATUS:",
                err.response?.status
            );

            console.error(
                "COLUMN SERVER RESPONSE:",
                err.response?.data
            );

            setColumns([]);

            if (
                err.response?.status === 401
            ) {

                setError(
                    "Authentication expired. Please login again."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You do not have permission to view task columns."
                );

            } else {

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load task columns."
                    )
                );
            }

        } finally {

            setColumnsLoading(false);
        }
    };

    // ==================================================
    // SELECTED PROJECT
    // ==================================================

    const selectedProject = useMemo(() => {

        return projects.find(
            (project) =>
                String(project.id) ===
                String(selectedProjectId)
        );

    }, [
        projects,
        selectedProjectId,
    ]);

    // ==================================================
    // SELECTED SPRINT
    // ==================================================

    const selectedSprint = useMemo(() => {

        return sprints.find(
            (sprint) =>
                String(sprint.id) ===
                String(selectedSprintId)
        );

    }, [
        sprints,
        selectedSprintId,
    ]);

    // ==================================================
    // PROJECT CHANGE
    // ==================================================

    const handleProjectChange = (
        event
    ) => {

        const value =
            String(event.target.value);

        console.log(
            "PROJECT CHANGED:",
            value
        );

        setSelectedProjectId(value);

        // Reset sprint immediately

        setSelectedSprintId("");

        setTasks([]);
        setColumns([]);
    };

    // ==================================================
    // SPRINT CHANGE
    // ==================================================

    const handleSprintChange = (
        event
    ) => {

        const value =
            String(event.target.value);

        console.log(
            "SPRINT CHANGED:",
            value
        );

        setSelectedSprintId(value);

        setTasks([]);
    };

    // ==================================================
    // TASK → COLUMN
    // ==================================================

    const getTaskColumnId = (
        task
    ) => {

        return (
            task.columnState?.id ??
            task.columnStateId ??
            task.taskColumn?.id ??
            task.taskColumnId ??
            null
        );
    };

    // ==================================================
    // TASK ASSIGNEE
    // ==================================================

    const getAssigneeName = (
        task
    ) => {

        const assignee =
            task.assignee;

        if (!assignee) {

            return "Unassigned";
        }

        return (
            assignee.fullName ||
            assignee.username ||
            assignee.email ||
            "Assigned"
        );
    };

    // ==================================================
    // TASKS FOR COLUMN
    // ==================================================

    const getTasksForColumn = (
        column
    ) => {

        return tasks.filter(
            (task) => {

                const taskColumnId =
                    getTaskColumnId(task);

                return String(
                    taskColumnId
                ) === String(
                    column.id
                );
            }
        );
    };

    const handleDrop = async (event, targetColumn) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/task-id") || draggedTaskId;
        setDraggedTaskId(null);

        if (!taskId || movingTaskId) return;

        const task = tasks.find((item) => String(item.id) === String(taskId));
        const currentColumnId = task && getTaskColumnId(task);
        if (!task || String(currentColumnId) === String(targetColumn.id)) return;

        const previousTasks = tasks;
        setTasks((current) =>
            current.map((item) =>
                String(item.id) === String(taskId)
                    ? {
                        ...item,
                        columnState: targetColumn,
                        columnStateId: targetColumn.id,
                        status: statusForColumn(targetColumn.name),
                    }
                    : item
            )
        );
        setMovingTaskId(taskId);
        setError("");

        try {
            const updatedTask = await moveTaskToColumn(task.id, targetColumn.id);
            setTasks((current) =>
                current.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );
        } catch (err) {
            setTasks(previousTasks);
            setError(getErrorMessage(err, "Unable to move task."));
        } finally {
            setMovingTaskId(null);
        }
    };

    const statusForColumn = (name) => {
        const normalized = String(name || "").toUpperCase();
        if (
            normalized.includes("DONE") ||
            normalized.includes("COMPLETE") ||
            normalized.includes("CLOSED")
        ) return "DONE";
        if (
            normalized.includes("PROGRESS") ||
            normalized.includes("CODING") ||
            normalized.includes("DEVELOP") ||
            normalized.includes("TEST")
        ) return "IN_PROGRESS";
        return "TODO";
    };

    // ==================================================
    // REFRESH
    // ==================================================

    const handleRefresh = async () => {

        if (
            projectsLoading ||
            sprintsLoading ||
            tasksLoading ||
            columnsLoading
        ) {
            return;
        }

        if (!selectedProjectId) {

            await loadProjects();

            return;
        }

        if (!selectedSprintId) {

            await loadSprints(
                selectedProjectId
            );

            return;
        }

        await loadSprintBoard(
            selectedSprintId
        );
    };

    // ==================================================
    // ERROR MESSAGE
    // ==================================================

    const getErrorMessage = (
        err,
        fallback
    ) => {

        if (
            typeof err.response?.data ===
            "string"
        ) {

            return err.response.data;
        }

        if (
            err.response?.data?.message
        ) {

            return err.response.data.message;
        }

        if (
            err.response?.data?.error
        ) {

            return err.response.data.error;
        }

        if (err.message) {

            return err.message;
        }

        return fallback;
    };

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <Box
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },
            }}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

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
                sx={{
                    mb: 3,
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Sprint Board
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        View tasks organized by
                        sprint workflow columns.
                    </Typography>

                </Box>

                <Chip
                    label={
                        `${tasks.length} Tasks`
                    }
                    variant="outlined"
                />

            </Stack>

            {/* ==================================================
                PROJECT + SPRINT SELECTORS
            ================================================== */}

            <Card
                sx={{
                    mb: 3,
                }}
            >

                <CardContent>

                    <Grid
                        container
                        spacing={2}
                    >

                        {/* PROJECT */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >

                            <FormControl
                                fullWidth
                                disabled={
                                    projectsLoading
                                }
                            >

                                <InputLabel>
                                    Select Project
                                </InputLabel>

                                <Select
                                    value={
                                        selectedProjectId
                                    }
                                    label="Select Project"
                                    onChange={
                                        handleProjectChange
                                    }
                                >

                                    {projects.map(
                                        (project) => (

                                            <MenuItem
                                                key={
                                                    project.id
                                                }
                                                value={
                                                    String(
                                                        project.id
                                                    )
                                                }
                                            >

                                                {
                                                    project.name
                                                }

                                                {project.projectKey
                                                    ? ` (${project.projectKey})`
                                                    : ""}

                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        </Grid>

                        {/* SPRINT */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >

                            <FormControl
                                fullWidth
                                disabled={
                                    !selectedProjectId ||
                                    sprintsLoading
                                }
                            >

                                <InputLabel>
                                    Select Sprint
                                </InputLabel>

                                <Select
                                    value={
                                        selectedSprintId
                                    }
                                    label="Select Sprint"
                                    onChange={
                                        handleSprintChange
                                    }
                                >

                                    {sprints.map(
                                        (sprint) => (

                                            <MenuItem
                                                key={
                                                    sprint.id
                                                }
                                                value={
                                                    String(
                                                        sprint.id
                                                    )
                                                }
                                            >

                                                {
                                                    sprint.name
                                                }

                                                {" - "}

                                                {
                                                    sprint.status ||
                                                    "PLANNED"
                                                }

                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        </Grid>

                    </Grid>

                </CardContent>

            </Card>

            {/* ==================================================
                LOADING PROJECTS
            ================================================== */}

            {projectsLoading && (

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 6,
                    }}
                >

                    <CircularProgress />

                </Box>
            )}

            {/* ==================================================
                NO PROJECTS
            ================================================== */}

            {!projectsLoading &&
                projects.length === 0 && (

                    <Alert
                        severity="warning"
                        sx={{
                            mb: 3,
                        }}
                    >
                        No projects are available.
                        Please create a project first.
                    </Alert>
                )}

            {/* ==================================================
                SELECTED PROJECT / SPRINT INFO
            ================================================== */}

            {selectedProject &&
                selectedSprint && (

                    <Card
                        sx={{
                            mb: 3,
                        }}
                    >

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
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        {
                                            selectedProject.name
                                        }
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Sprint:{" "}
                                        {
                                            selectedSprint.name
                                        }
                                    </Typography>

                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                >

                                    <Chip
                                        size="small"
                                        label={
                                            selectedSprint.status ||
                                            "PLANNED"
                                        }
                                    />

                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={
                                            `${tasks.length} Tasks`
                                        }
                                    />

                                </Stack>

                            </Stack>

                        </CardContent>

                    </Card>
                )}

            {/* ==================================================
                BOARD LOADING
            ================================================== */}

            {selectedSprintId &&
                (tasksLoading ||
                    columnsLoading) && (

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >

                        <Stack
                            spacing={1}
                            alignItems="center"
                        >

                            <CircularProgress />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Loading sprint board...
                            </Typography>

                        </Stack>

                    </Box>
                )}

            {/* ==================================================
                NO SPRINT
            ================================================== */}

            {!projectsLoading &&
                selectedProjectId &&
                sprints.length === 0 &&
                !sprintsLoading && (

                    <Alert severity="info">
                        No sprints found for this
                        project.
                    </Alert>
                )}

            {/* ==================================================
                NO COLUMNS
            ================================================== */}

            {selectedSprintId &&
                !columnsLoading &&
                columns.length === 0 &&
                !tasksLoading && (

                    <Alert
                        severity="warning"
                        sx={{
                            mb: 3,
                        }}
                    >
                        No task columns are configured
                        for this project.
                    </Alert>
                )}

            {/* ==================================================
                BOARD
            ================================================== */}

            {selectedSprintId &&
                !tasksLoading &&
                !columnsLoading &&
                columns.length > 0 && (

                    <Box
                        sx={{
                            width: "100%",
                            overflowX: "auto",
                            pb: 2,
                        }}
                    >

                        <Grid
                            container
                            spacing={2}
                            sx={{
                                flexWrap: "nowrap",
                                minWidth:
                                    Math.max(
                                        columns.length *
                                        290,
                                        1000
                                    ),
                            }}
                        >

                            {columns.map(
                                (column) => {

                                    const columnTasks =
                                        getTasksForColumn(
                                            column
                                        );

                                    return (

                                        <Grid
                                            item
                                            key={
                                                column.id
                                            }
                                            sx={{
                                                width: 290,
                                                minWidth: 290,
                                            }}
                                        >

                                            <Card
                                                sx={{
                                                    height:
                                                        "100%",
                                                    minHeight:
                                                        350,
                                                }}
                                                onDragOver={(event) =>
                                                    event.preventDefault()
                                                }
                                                onDrop={(event) =>
                                                    handleDrop(event, column)
                                                }
                                            >

                                                {/* COLUMN HEADER */}

                                                <CardContent
                                                    sx={{
                                                        pb: 1,
                                                    }}
                                                >

                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                        spacing={1}
                                                    >

                                                        <Typography
                                                            variant="h6"
                                                            fontWeight={700}
                                                            sx={{
                                                                fontSize:
                                                                    "1rem",
                                                            }}
                                                        >
                                                            {
                                                                column.name
                                                            }
                                                        </Typography>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                columnTasks.length
                                                            }
                                                        />

                                                    </Stack>

                                                </CardContent>

                                                <Divider />

                                                {/* COLUMN TASKS */}

                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                    }}
                                                >

                                                    {columnTasks.length ===
                                                        0 && (

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                textAlign:
                                                                    "center",
                                                                py: 4,
                                                            }}
                                                        >
                                                            No tasks
                                                        </Typography>

                                                    )}

                                                    <Stack
                                                        spacing={1.5}
                                                    >

                                                        {columnTasks.map(
                                                            (task) => (

                                                                <Card
                                                                    key={
                                                                        task.id
                                                                    }
                                                                    variant="outlined"
                                                                    sx={{
                                                                        cursor:
                                                                            movingTaskId === task.id
                                                                                ? "wait"
                                                                                : "grab",
                                                                        opacity:
                                                                            movingTaskId === task.id
                                                                                ? 0.6
                                                                                : 1,
                                                                    }}
                                                                    draggable={
                                                                        movingTaskId !== task.id
                                                                    }
                                                                    onDragStart={(event) => {
                                                                        setDraggedTaskId(task.id);
                                                                        event.dataTransfer.setData(
                                                                            "text/task-id",
                                                                            String(task.id)
                                                                        );
                                                                        event.dataTransfer.effectAllowed =
                                                                            "move";
                                                                    }}
                                                                    onDragEnd={() =>
                                                                        setDraggedTaskId(null)
                                                                    }
                                                                >

                                                                    <CardContent
                                                                        sx={{
                                                                            "&:last-child":
                                                                                {
                                                                                    pb: 2,
                                                                                },
                                                                        }}
                                                                    >

                                                                        {/* TASK KEY */}

                                                                        {task.taskKey && (

                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                            >
                                                                                {
                                                                                    task.taskKey
                                                                                }
                                                                            </Typography>

                                                                        )}

                                                                        {/* TASK TITLE */}

                                                                        <Typography
                                                                            variant="subtitle1"
                                                                            fontWeight={700}
                                                                            sx={{
                                                                                mt:
                                                                                    0.25,
                                                                            }}
                                                                        >
                                                                            {
                                                                                task.title ||
                                                                                "Untitled Task"
                                                                            }
                                                                        </Typography>

                                                                        {/* DESCRIPTION */}

                                                                        {task.description && (

                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    mt:
                                                                                        0.75,
                                                                                    display:
                                                                                        "-webkit-box",
                                                                                    WebkitLineClamp:
                                                                                        3,
                                                                                    WebkitBoxOrient:
                                                                                        "vertical",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    task.description
                                                                                }
                                                                            </Typography>

                                                                        )}

                                                                        {/* PRIORITY + STATUS */}

                                                                        <Stack
                                                                            direction="row"
                                                                            spacing={0.75}
                                                                            flexWrap="wrap"
                                                                            sx={{
                                                                                mt:
                                                                                    1.5,
                                                                            }}
                                                                        >

                                                                            <Chip
                                                                                size="small"
                                                                                label={
                                                                                    task.priority ||
                                                                                    "MEDIUM"
                                                                                }
                                                                            />

                                                                            <Chip
                                                                                size="small"
                                                                                variant="outlined"
                                                                                label={
                                                                                    task.status ||
                                                                                    "TODO"
                                                                                }
                                                                            />

                                                                        </Stack>

                                                                        {/* ASSIGNEE */}

                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                            sx={{
                                                                                display:
                                                                                    "block",
                                                                                mt:
                                                                                    1.5,
                                                                            }}
                                                                        >
                                                                            Assignee:{" "}
                                                                            <strong>
                                                                                {
                                                                                    getAssigneeName(
                                                                                        task
                                                                                    )
                                                                                }
                                                                            </strong>
                                                                        </Typography>

                                                                        {/* DUE DATE */}

                                                                        {task.dueDate && (

                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    display:
                                                                                        "block",
                                                                                    mt:
                                                                                        0.5,
                                                                                }}
                                                                            >
                                                                                Due:{" "}
                                                                                {
                                                                                    task.dueDate
                                                                                }
                                                                            </Typography>

                                                                        )}

                                                                    </CardContent>

                                                                </Card>

                                                            )
                                                        )}

                                                    </Stack>

                                                </Box>

                                            </Card>

                                        </Grid>
                                    );
                                }
                            )}

                        </Grid>

                    </Box>
                )}

            {/* ==================================================
                SELECT SPRINT MESSAGE
            ================================================== */}

            {selectedProjectId &&
                sprints.length > 0 &&
                !selectedSprintId &&
                !sprintsLoading && (

                    <Alert severity="info">
                        Please select a sprint to
                        display the board.
                    </Alert>
                )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    onClose={() =>
                        setError("")
                    }
                    sx={{
                        mt: 3,
                    }}
                >
                    {error}
                </Alert>
            )}

        </Box>
    );
};

export default SprintBoardPage;