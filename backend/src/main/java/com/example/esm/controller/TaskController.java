package com.example.esm.controller;

import com.example.esm.dto.TaskRequest;
import com.example.esm.entity.Project;
import com.example.esm.entity.Sprint;
import com.example.esm.entity.Task;
import com.example.esm.entity.TaskColumn;
import com.example.esm.entity.User;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.SprintRepository;
import com.example.esm.repo.TaskColumnRepository;
import com.example.esm.repo.TaskRepository;
import com.example.esm.repo.UserRepository;
import com.example.esm.service.AssignmentNotificationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tasks")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final AssignmentNotificationService assignmentNotificationService;


    // =========================================================
    // GET ALL TASKS
    // GET /api/admin/tasks
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {

        return ResponseEntity.ok(
                taskRepository.findAll()
        );
    }


    // =========================================================
    // GET TASK COLUMNS
    // IMPORTANT: Keep this BEFORE /{id}
    // GET /api/admin/tasks/columns
    // =========================================================

    @GetMapping("/columns")
    public ResponseEntity<List<TaskColumn>> getTaskColumns() {

        return ResponseEntity.ok(
                taskColumnRepository
                        .findAllByOrderByPositionAsc()
        );
    }


    // =========================================================
    // GET TASKS BY PROJECT
    // GET /api/admin/tasks/project/{projectId}
    // =========================================================

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getProjectTasks(
            @PathVariable Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                taskRepository.findByProjectId(projectId)
        );
    }


    // =========================================================
    // GET ACTIVE SPRINT TASKS
    // GET /api/admin/tasks/project/{projectId}/active-sprint
    // =========================================================

    @GetMapping("/project/{projectId}/active-sprint")
    public ResponseEntity<List<Task>> getActiveSprintTasks(
            @PathVariable Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }

        return sprintRepository
                .findFirstByProjectIdAndStatusIgnoreCaseOrderByStartDateDesc(
                        projectId,
                        "ACTIVE"
                )
                .map(sprint ->
                        ResponseEntity.ok(
                                taskRepository.findByProjectIdAndSprintId(
                                        projectId,
                                        sprint.getId()
                                )
                        )
                )
                .orElseGet(() ->
                        ResponseEntity.ok(List.of())
                );
    }


    // =========================================================
    // GET TASKS BY SPRINT
    // GET /api/admin/tasks/sprint/{sprintId}
    // =========================================================

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getSprintTasks(
            @PathVariable Long sprintId) {

        if (!sprintRepository.existsById(sprintId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                taskRepository.findBySprintId(sprintId)
        );
    }


    // =========================================================
    // GET TASK BY ID
    // GET /api/admin/tasks/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(
            @PathVariable Long id) {

        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // CREATE TASK
    // POST /api/admin/tasks
    // =========================================================

    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody TaskRequest request) {

        Project project = findProject(
                request.projectId()
        );

        TaskColumn column = request.columnId() == null
                ? findDefaultColumn(project.getId())
                : findColumn(request.columnId());

        validateProjectAssociation(
                project,
                column.getProject(),
                "Column"
        );

        Sprint sprint = findSprint(
                request.sprintId()
        );

        if (sprint != null) {

            validateProjectAssociation(
                    project,
                    sprint.getProject(),
                    "Sprint"
            );
        }

        User assignee = findUser(
                request.assigneeId()
        );

        Task task = Task.builder()
                .title(
                        request.title() == null
                                ? null
                                : request.title().trim()
                )
                .description(
                        request.description()
                )
                .priority(
                        normalize(
                                request.priority(),
                                "MEDIUM"
                        )
                )
                .status(request.status() == null || request.status().isBlank()
                        ? statusForColumn(column.getName())
                        : normalize(request.status(), "TODO"))
                .dueDate(
                        request.dueDate()
                )
                .project(
                        project
                )
                .columnState(
                        column
                )
                .sprint(
                        sprint
                )
                .assignee(
                        assignee
                )
                .build();

        Task savedTask =
                taskRepository.save(task);

        if (savedTask.getAssignee() != null) {
            assignmentNotificationService.notifyTaskAssignment(savedTask);
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTask);
    }


    // =========================================================
    // UPDATE TASK
    // PUT /api/admin/tasks/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        Task task = taskRepository.findById(id)
                .orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        Long previousAssigneeId = task.getAssignee() == null
                ? null
                : task.getAssignee().getId();

        Project project = findProject(
                request.projectId()
        );

        TaskColumn column = findColumn(
                request.columnId()
        );

        validateProjectAssociation(
                project,
                column.getProject(),
                "Column"
        );

        Sprint sprint = findSprint(
                request.sprintId()
        );

        if (sprint != null) {

            validateProjectAssociation(
                    project,
                    sprint.getProject(),
                    "Sprint"
            );
        }

        User assignee = findUser(
                request.assigneeId()
        );

        task.setTitle(
                request.title() == null
                        ? null
                        : request.title().trim()
        );

        task.setDescription(
                request.description()
        );

        task.setPriority(
                normalize(
                        request.priority(),
                        "MEDIUM"
                )
        );

        task.setStatus(
                normalize(
                        request.status(),
                        "TODO"
                )
        );

        task.setDueDate(
                request.dueDate()
        );

        task.setProject(
                project
        );

        task.setColumnState(
                column
        );

        task.setSprint(
                sprint
        );

        task.setAssignee(
                assignee
        );

        Task updatedTask =
                taskRepository.save(task);

        if (updatedTask.getAssignee() != null
                && !updatedTask.getAssignee().getId().equals(previousAssigneeId)) {
            assignmentNotificationService.notifyTaskAssignment(updatedTask);
        }

        return ResponseEntity.ok(
                updatedTask
        );
    }


    // =========================================================
    // DELETE TASK
    // DELETE /api/admin/tasks/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id) {

        if (!taskRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        taskRepository.deleteById(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================================================
    // MOVE TASK TO COLUMN
    // PUT /api/admin/tasks/{taskId}/column/{columnId}
    // =========================================================

    @PutMapping("/{taskId}/column/{columnId}")
    public ResponseEntity<Task> moveTaskToColumn(
            @PathVariable Long taskId,
            @PathVariable Long columnId) {

        Task task = taskRepository.findById(taskId)
                .orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        TaskColumn column =
                taskColumnRepository.findById(columnId)
                        .orElse(null);

        if (column == null) {
            return ResponseEntity.notFound().build();
        }

        validateProjectAssociation(
                task.getProject(),
                column.getProject(),
                "Column"
        );

        task.setColumnState(
                column
        );
        task.setStatus(statusForColumn(column.getName()));

        Task savedTask =
                taskRepository.save(task);

        return ResponseEntity.ok(
                savedTask
        );
    }


    // =========================================================
    // CHANGE ASSIGNEE
    // PUT /api/admin/tasks/{taskId}/assignee/{userId}
    // =========================================================

    @PutMapping("/{taskId}/assignee/{userId}")
    public ResponseEntity<Task> assignTask(
            @PathVariable Long taskId,
            @PathVariable Long userId) {

        Task task = taskRepository.findById(taskId)
                .orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Long previousAssigneeId = task.getAssignee() == null
                ? null
                : task.getAssignee().getId();

        task.setAssignee(
                user
        );

        Task savedTask =
                taskRepository.save(task);

        if (!savedTask.getAssignee().getId().equals(previousAssigneeId)) {
            assignmentNotificationService.notifyTaskAssignment(savedTask);
        }

        return ResponseEntity.ok(
                savedTask
        );
    }


    // =========================================================
    // REMOVE ASSIGNEE
    // DELETE /api/admin/tasks/{taskId}/assignee
    // =========================================================

    @DeleteMapping("/{taskId}/assignee")
    public ResponseEntity<String> removeAssignee(
            @PathVariable Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElse(null);

        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        task.setAssignee(null);

        taskRepository.save(task);

        return ResponseEntity.ok(
                "Assignee removed successfully"
        );
    }


    // =========================================================
    // HELPER METHODS
    // =========================================================

    private Project findProject(Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project not found: " + id
                        )
                );
    }


    private TaskColumn findColumn(Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Column ID is required"
            );
        }

        return taskColumnRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Column not found: " + id
                        )
                );
    }

    private TaskColumn findDefaultColumn(Long projectId) {
        return taskColumnRepository.findByProjectIdOrderByPositionAsc(projectId)
                .stream()
                .filter(column -> column.getName() != null
                        && (column.getName().equalsIgnoreCase("To Do")
                        || column.getName().equalsIgnoreCase("TODO")
                        || column.getName().equalsIgnoreCase("Planning")))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No To Do workflow column exists for this project"));
    }


    private Sprint findSprint(Long id) {

        if (id == null) {
            return null;
        }

        return sprintRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Sprint not found: " + id
                        )
                );
    }


    private User findUser(Long id) {

        if (id == null) {
            return null;
        }

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Assignee not found: " + id
                        )
                );
    }

    private String statusForColumn(String columnName) {
        String normalized = columnName == null
                ? ""
                : columnName.trim().toUpperCase().replace('-', '_').replace(' ', '_');

        if (normalized.contains("DONE")
                || normalized.contains("COMPLETE")
                || normalized.contains("CLOSED")) {
            return "DONE";
        }

        if (normalized.contains("PROGRESS")
                || normalized.contains("CODING")
                || normalized.contains("DEVELOP")
                || normalized.contains("TEST")) {
            return "IN_PROGRESS";
        }

        return "TODO";
    }


    private void validateProjectAssociation(
            Project project,
            Project associatedProject,
            String resourceName) {

        if (project == null ||
                associatedProject == null ||
                project.getId() == null ||
                associatedProject.getId() == null ||
                !project.getId().equals(
                        associatedProject.getId()
                )) {

            throw new IllegalArgumentException(
                    resourceName +
                    " must belong to the selected project"
            );
        }
    }


    private String normalize(
            String value,
            String fallback) {

        if (value == null ||
                value.trim().isEmpty()) {

            return fallback;
        }

        return value
                .trim()
                .toUpperCase();
    }
}