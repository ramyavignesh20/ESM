package com.example.esm.controller;

import com.example.esm.entity.Project;
import com.example.esm.entity.TaskColumn;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.TaskColumnRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/task-columns")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TaskColumnController {

    private final TaskColumnRepository taskColumnRepository;
    private final ProjectRepository projectRepository;

    // =========================================================
    // GET ALL TASK COLUMNS
    // GET /api/admin/task-columns
    // =========================================================
    @GetMapping
    public ResponseEntity<List<TaskColumn>> getAllColumns() {

        List<TaskColumn> columns =
                taskColumnRepository.findAll();

        return ResponseEntity.ok(columns);
    }

    // =========================================================
    // GET TASK COLUMN BY ID
    // GET /api/admin/task-columns/{id}
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getColumnById(
            @PathVariable Long id) {

        TaskColumn column =
                taskColumnRepository.findById(id).orElse(null);

        if (column == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Task column not found");
        }

        return ResponseEntity.ok(column);
    }

    // =========================================================
    // GET TASK COLUMNS BY PROJECT
    // GET /api/admin/task-columns/project/{projectId}
    // =========================================================
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getColumnsByProject(
            @PathVariable Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Project not found");
        }

        List<TaskColumn> columns =
                taskColumnRepository
                        .findByProjectIdOrderByPositionAsc(projectId);

        return ResponseEntity.ok(columns);
    }

    // =========================================================
    // CREATE TASK COLUMN
    // POST /api/admin/task-columns
    // =========================================================
    @PostMapping
    public ResponseEntity<?> createColumn(
            @RequestBody TaskColumnRequest request) {

        if (request.getName() == null ||
                request.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Column name is required");
        }

        if (request.getProjectId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Project ID is required");
        }

        Project project =
                projectRepository.findById(request.getProjectId())
                        .orElse(null);

        if (project == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Project not found");
        }

        TaskColumn column = TaskColumn.builder()
                .name(request.getName().trim())
                .position(
                        request.getPosition() != null
                                ? request.getPosition()
                                : 0
                )
                .project(project)
                .build();

        TaskColumn savedColumn =
                taskColumnRepository.save(column);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedColumn);
    }

    // =========================================================
    // UPDATE TASK COLUMN
    // PUT /api/admin/task-columns/{id}
    // =========================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateColumn(
            @PathVariable Long id,
            @RequestBody TaskColumnRequest request) {

        TaskColumn existingColumn =
                taskColumnRepository.findById(id).orElse(null);

        if (existingColumn == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Task column not found");
        }

        if (request.getName() != null &&
                !request.getName().trim().isEmpty()) {

            existingColumn.setName(
                    request.getName().trim()
            );
        }

        if (request.getPosition() != null) {

            existingColumn.setPosition(
                    request.getPosition()
            );
        }

        if (request.getProjectId() != null) {

            Project project =
                    projectRepository.findById(
                            request.getProjectId()
                    ).orElse(null);

            if (project == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Project not found");
            }

            existingColumn.setProject(project);
        }

        TaskColumn updatedColumn =
                taskColumnRepository.save(existingColumn);

        return ResponseEntity.ok(updatedColumn);
    }

    // =========================================================
    // DELETE TASK COLUMN
    // DELETE /api/admin/task-columns/{id}
    // =========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteColumn(
            @PathVariable Long id) {

        if (!taskColumnRepository.existsById(id)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Task column not found");
        }

        taskColumnRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // REQUEST DTO
    // =========================================================
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskColumnRequest {

        private String name;

        private Integer position;

        private Long projectId;
    }
}