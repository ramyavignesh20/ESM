package com.example.esm.controller;

import com.example.esm.entity.Project;
import com.example.esm.entity.Sprint;
import com.example.esm.entity.TaskColumn;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.TaskColumnRepository;
import com.example.esm.repo.SprintRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final SprintRepository sprintRepository;

    // =========================================================
    // GET ALL PROJECTS
    // GET /api/admin/projects
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {

        List<Project> projects =
                projectRepository.findAll();

        return ResponseEntity.ok(projects);
    }

    // =========================================================
    // GET PROJECT BY ID
    // GET /api/admin/projects/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @PathVariable Long id) {

        Project project =
                projectRepository.findById(id)
                        .orElse(null);

        if (project == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Project not found with ID: " + id);
        }

        return ResponseEntity.ok(project);
    }

    // =========================================================
    // CREATE PROJECT
    // POST /api/admin/projects
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createProject(
            @RequestBody Project project) {

        // -----------------------------------------------------
        // VALIDATE NAME
        // -----------------------------------------------------

        if (project.getName() == null ||
                project.getName().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Project name is required");
        }

        // -----------------------------------------------------
        // VALIDATE PROJECT KEY
        // -----------------------------------------------------

        if (project.getProjectKey() == null ||
                project.getProjectKey().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Project key is required");
        }

        String projectKey =
                project.getProjectKey()
                        .trim()
                        .toUpperCase();

        // -----------------------------------------------------
        // CHECK DUPLICATE KEY
        // -----------------------------------------------------

        if (projectRepository.existsByProjectKey(
                projectKey)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Project key already exists");
        }

        // -----------------------------------------------------
        // NORMALIZE DATA
        // -----------------------------------------------------

        project.setName(
                project.getName().trim()
        );

        project.setProjectKey(
                projectKey
        );

        if (project.getStatus() == null ||
                project.getStatus().isBlank()) {

            project.setStatus("ACTIVE");

        } else {

            project.setStatus(
                    project.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Project savedProject =
                projectRepository.save(project);

        String[] defaultColumns = {
                "To Do", "In Progress", "Testing", "Done"
        };
        for (int i = 0; i < defaultColumns.length; i++) {
            taskColumnRepository.save(TaskColumn.builder()
                    .name(defaultColumns[i])
                    .position(i)
                    .project(savedProject)
                    .build());
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedProject);
    }

    // =========================================================
    // UPDATE PROJECT
    // PUT /api/admin/projects/{id}
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @RequestBody Project projectDetails) {

        // -----------------------------------------------------
        // FIND EXISTING PROJECT
        // -----------------------------------------------------

        Project existingProject =
                projectRepository.findById(id)
                        .orElse(null);

        if (existingProject == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Project not found with ID: " + id
                    );
        }

        // -----------------------------------------------------
        // VALIDATE NAME
        // -----------------------------------------------------

        if (projectDetails.getName() == null ||
                projectDetails.getName().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Project name is required");
        }

        // -----------------------------------------------------
        // VALIDATE PROJECT KEY
        // -----------------------------------------------------

        if (projectDetails.getProjectKey() == null ||
                projectDetails.getProjectKey().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body("Project key is required");
        }

        String projectKey =
                projectDetails.getProjectKey()
                        .trim()
                        .toUpperCase();

        // -----------------------------------------------------
        // CHECK DUPLICATE KEY
        // -----------------------------------------------------

        if (projectRepository.existsByProjectKeyAndIdNot(
                projectKey,
                id)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Project key already exists");
        }

        // -----------------------------------------------------
        // UPDATE BASIC DATA
        // -----------------------------------------------------

        existingProject.setName(
                projectDetails.getName().trim()
        );

        existingProject.setProjectKey(
                projectKey
        );

        // -----------------------------------------------------
        // UPDATE STATUS
        // -----------------------------------------------------

        if (projectDetails.getStatus() != null &&
                !projectDetails.getStatus().isBlank()) {

            existingProject.setStatus(
                    projectDetails.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Project updatedProject =
                projectRepository.save(existingProject);

        return ResponseEntity.ok(updatedProject);
    }

    // =========================================================
    // DELETE PROJECT
    // DELETE /api/admin/projects/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long id) {

        // -----------------------------------------------------
        // CHECK PROJECT
        // -----------------------------------------------------

        if (!projectRepository.existsById(id)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Project not found with ID: " + id
                    );
        }

        // -----------------------------------------------------
        // DELETE
        // -----------------------------------------------------

        projectRepository.deleteById(id);

        return ResponseEntity.ok(
                "Project deleted successfully"
        );
    }

    // =========================================================
    // GET SPRINTS BY PROJECT
    // GET /api/admin/projects/{projectId}/sprints
    // =========================================================

    @GetMapping("/{projectId}/sprints")
    public ResponseEntity<?> getSprintsByProject(
            @PathVariable Long projectId) {

        // -----------------------------------------------------
        // CHECK PROJECT
        // -----------------------------------------------------

        if (!projectRepository.existsById(projectId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Project not found with ID: " + projectId
                    );
        }

        // -----------------------------------------------------
        // GET SPRINTS
        // -----------------------------------------------------

        List<Sprint> sprints =
                sprintRepository
                        .findByProjectIdOrderByStartDateDesc(
                                projectId
                        );

        return ResponseEntity.ok(sprints);
    }
}