package com.example.esm.controller;

import com.example.esm.dto.SprintRequest;
import com.example.esm.entity.Sprint;
import com.example.esm.service.SprintService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sprints")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class SprintController {

    private final SprintService sprintService;

    // =========================================================
    // RESPONSE DTO
    // =========================================================

    public record SprintActionResponse(
            Long id,
            String name,
            String status,
            String message
    ) {
    }

    // =========================================================
    // GET ALL SPRINTS
    // GET /api/admin/sprints
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {

        System.out.println("========================================");
        System.out.println("GET ALL SPRINTS");
        System.out.println("========================================");

        List<Sprint> sprints =
                sprintService.getAllSprints();

        System.out.println(
                "Sprint count = " + sprints.size()
        );

        return ResponseEntity.ok(sprints);
    }

    // =========================================================
    // GET SPRINT BY ID
    // GET /api/admin/sprints/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getSprint(
            @PathVariable Long id) {

        try {

            Sprint sprint =
                    sprintService.getSprintById(id);

            return ResponseEntity.ok(sprint);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Sprint not found: " + id
                    );
        }
    }

    // =========================================================
    // GET SPRINTS BY PROJECT
    // GET /api/admin/sprints/project/{projectId}
    // =========================================================

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>>
    getSprintsByProject(
            @PathVariable Long projectId) {

        System.out.println("========================================");
        System.out.println("GET SPRINTS BY PROJECT");
        System.out.println(
                "Project ID = " + projectId
        );
        System.out.println("========================================");

        return ResponseEntity.ok(
                sprintService.getSprintsByProject(
                        projectId
                )
        );
    }

    // =========================================================
    // CREATE SPRINT
    // POST /api/admin/sprints
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createSprint(
            @Valid @RequestBody SprintRequest request) {

        try {

            System.out.println("========================================");
            System.out.println("CREATE SPRINT");
            System.out.println("========================================");

            System.out.println(
                    "Name = " + request.name()
            );

            System.out.println(
                    "Project ID = " + request.projectId()
            );

            System.out.println(
                    "Start Date = " + request.startDate()
            );

            System.out.println(
                    "End Date = " + request.endDate()
            );

            // -------------------------------------------------
            // PROJECT ID
            // -------------------------------------------------

            if (request.projectId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Project ID is required");
            }

            // -------------------------------------------------
            // NAME
            // -------------------------------------------------

            if (request.name() == null ||
                    request.name().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Sprint name is required"
                        );
            }

            // -------------------------------------------------
            // DATES
            // -------------------------------------------------

            if (request.startDate() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Start date is required"
                        );
            }

            if (request.endDate() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "End date is required"
                        );
            }

            // -------------------------------------------------
            // DATE VALIDATION
            // -------------------------------------------------

            if (request.endDate()
                    .isBefore(request.startDate())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "End date cannot be before start date"
                        );
            }

            // -------------------------------------------------
            // CREATE
            // -------------------------------------------------

            Sprint sprint =
                    sprintService.createSprint(
                            request.name(),
                            request.goal(),
                            request.startDate(),
                            request.endDate(),
                            request.status(),
                            request.projectId()
                    );

            System.out.println(
                    "Sprint created successfully. ID = "
                            + sprint.getId()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(sprint);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // UPDATE SPRINT
    // PUT /api/admin/sprints/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSprint(
            @PathVariable Long id,
            @Valid @RequestBody SprintRequest request) {

        try {

            System.out.println("========================================");
            System.out.println("UPDATE SPRINT");
            System.out.println(
                    "Sprint ID = " + id
            );
            System.out.println(
                    "Project ID = " + request.projectId()
            );
            System.out.println("========================================");

            // -------------------------------------------------
            // PROJECT ID
            // -------------------------------------------------

            if (request.projectId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Project ID is required"
                        );
            }

            // -------------------------------------------------
            // NAME
            // -------------------------------------------------

            if (request.name() == null ||
                    request.name().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Sprint name is required"
                        );
            }

            // -------------------------------------------------
            // DATES
            // -------------------------------------------------

            if (request.startDate() == null ||
                    request.endDate() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Start date and end date are required"
                        );
            }

            // -------------------------------------------------
            // DATE VALIDATION
            // -------------------------------------------------

            if (request.endDate()
                    .isBefore(request.startDate())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "End date cannot be before start date"
                        );
            }

            // -------------------------------------------------
            // UPDATE
            // -------------------------------------------------

            Sprint sprint =
                    sprintService.updateSprint(
                            id,
                            request.name(),
                            request.goal(),
                            request.startDate(),
                            request.endDate(),
                            request.status(),
                            request.projectId()
                    );

            return ResponseEntity.ok(sprint);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // START SPRINT
    // PATCH /api/admin/sprints/{id}/start
    // =========================================================

    @PatchMapping("/{id}/start")
    public ResponseEntity<?> startSprint(
            @PathVariable Long id) {

        try {

            System.out.println("========================================");
            System.out.println("START SPRINT");
            System.out.println(
                    "Sprint ID = " + id
            );
            System.out.println("========================================");

            Sprint sprint =
                    sprintService.startSprint(id);

            SprintActionResponse response =
                    new SprintActionResponse(
                            sprint.getId(),
                            sprint.getName(),
                            sprint.getStatus(),
                            "Sprint started successfully"
                    );

            System.out.println(
                    "Sprint started successfully"
            );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // COMPLETE SPRINT
    // PATCH /api/admin/sprints/{id}/complete
    // =========================================================

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeSprint(
            @PathVariable Long id) {

        try {

            System.out.println("========================================");
            System.out.println("COMPLETE SPRINT");
            System.out.println(
                    "Sprint ID = " + id
            );
            System.out.println("========================================");

            Sprint sprint =
                    sprintService.completeSprint(id);

            // -------------------------------------------------
            // IMPORTANT:
            // Do NOT return the Sprint entity directly here.
            //
            // This prevents Jackson from serializing:
            //
            // Sprint
            //   -> Project
            //      -> HibernateProxy
            //         -> ByteBuddyInterceptor
            //
            // which was causing the previous serialization
            // failure.
            // -------------------------------------------------

            SprintActionResponse response =
                    new SprintActionResponse(
                            sprint.getId(),
                            sprint.getName(),
                            sprint.getStatus(),
                            "Sprint completed successfully"
                    );

            System.out.println(
                    "Sprint completed successfully"
            );

            System.out.println(
                    "Sprint ID = " +
                            sprint.getId()
            );

            System.out.println(
                    "Status = " +
                            sprint.getStatus()
            );

            System.out.println("========================================");

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {

            System.out.println(
                    "SPRINT COMPLETION BLOCKED"
            );

            System.out.println(
                    "Reason = " + e.getMessage()
            );

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE SPRINT
    // DELETE /api/admin/sprints/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSprint(
            @PathVariable Long id) {

        try {

            sprintService.deleteSprint(id);

            return ResponseEntity.ok(
                    "Sprint deleted successfully"
            );

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}