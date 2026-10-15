
package com.example.esm.service;

import com.example.esm.entity.Project;
import com.example.esm.entity.Sprint;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.SprintRepository;
import com.example.esm.repo.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    // =========================================================
    // GET ALL SPRINTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Sprint> getAllSprints() {

        List<Sprint> sprints =
                sprintRepository.findAll();

        initializeProject(sprints);

        return sprints;
    }

    // =========================================================
    // GET SPRINT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Sprint getSprintById(Long id) {

        Sprint sprint =
                sprintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found with id: " + id
                                )
                        );

        initializeProject(sprint);

        return sprint;
    }

    // =========================================================
    // GET SPRINTS BY PROJECT
    // =========================================================

    @Transactional(readOnly = true)
    public List<Sprint> getSprintsByProject(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException(
                    "Project not found with id: " + projectId
            );
        }

        List<Sprint> sprints =
                sprintRepository
                        .findByProjectIdOrderByStartDateDesc(
                                projectId
                        );

        initializeProject(sprints);

        return sprints;
    }

    // =========================================================
    // CREATE SPRINT
    // =========================================================

    public Sprint createSprint(
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long projectId) {

        validateSprintData(
                name,
                startDate,
                endDate,
                projectId
        );

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found with id: "
                                                + projectId
                                )
                        );

        Sprint sprint =
                Sprint.builder()
                        .name(name.trim())
                        .goal(
                                goal != null
                                        ? goal.trim()
                                        : null
                        )
                        .startDate(startDate)
                        .endDate(endDate)
                        .status(normalizeStatus(status))
                        .project(project)
                        .build();

        Sprint savedSprint =
                sprintRepository.save(sprint);

        initializeProject(savedSprint);

        return savedSprint;
    }

    // =========================================================
    // UPDATE SPRINT
    // =========================================================

    public Sprint updateSprint(
            Long id,
            String name,
            String goal,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long projectId) {

        validateSprintData(
                name,
                startDate,
                endDate,
                projectId
        );

        Sprint sprint =
                sprintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found with id: " + id
                                )
                        );

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found with id: "
                                                + projectId
                                )
                        );

        String requestedStatus =
                normalizeStatus(status);

        validateStatusTransition(
                sprint.getStatus(),
                requestedStatus
        );

        sprint.setName(name.trim());

        sprint.setGoal(
                goal != null
                        ? goal.trim()
                        : null
        );

        sprint.setStartDate(startDate);
        sprint.setEndDate(endDate);
        sprint.setProject(project);
        sprint.setStatus(requestedStatus);

        Sprint savedSprint =
                sprintRepository.save(sprint);

        initializeProject(savedSprint);

        return savedSprint;
    }

    // =========================================================
    // DELETE SPRINT
    // =========================================================

    public void deleteSprint(Long id) {

        if (!sprintRepository.existsById(id)) {
            throw new RuntimeException(
                    "Sprint not found with id: " + id
            );
        }

        sprintRepository.deleteById(id);
    }

    // =========================================================
    // START SPRINT
    // =========================================================

    public Sprint startSprint(Long id) {

        Sprint sprint = getSprintById(id);

        if (!"PLANNED".equalsIgnoreCase(
                sprint.getStatus())) {

            throw new IllegalStateException(
                    "Only a planned sprint can be started"
            );
        }

        if (sprint.getGoal() == null ||
                sprint.getGoal().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Sprint goal is required before starting"
            );
        }

        sprint.setStatus("ACTIVE");

        Sprint savedSprint =
                sprintRepository.saveAndFlush(sprint);

        initializeProject(savedSprint);

        return savedSprint;
    }

    // =========================================================
    // COMPLETE SPRINT
    // =========================================================

    @Transactional
    public Sprint completeSprint(Long id) {

        Sprint sprint =
                sprintRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sprint not found with id: " + id
                                )
                        );

        // -----------------------------------------------------
        // Sprint must currently be ACTIVE
        // -----------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                sprint.getStatus())) {

            throw new IllegalStateException(
                    "Only an active sprint can be completed"
            );
        }

        // -----------------------------------------------------
        // Count sprint tasks
        // -----------------------------------------------------

        long totalTasks =
                taskRepository.countBySprintId(id);

        long completedTasks =
                taskRepository
                        .countBySprintIdAndStatusIgnoreCase(
                                id,
                                "DONE"
                        );

        System.out.println();
        System.out.println(
                "========== COMPLETE SPRINT =========="
        );
        System.out.println(
                "SPRINT ID       = " + id
        );
        System.out.println(
                "CURRENT STATUS  = " + sprint.getStatus()
        );
        System.out.println(
                "TOTAL TASKS     = " + totalTasks
        );
        System.out.println(
                "COMPLETED TASKS = " + completedTasks
        );

        // -----------------------------------------------------
        // Block completion if tasks remain incomplete
        // -----------------------------------------------------

        if (totalTasks > 0 &&
                totalTasks != completedTasks) {

            throw new IllegalStateException(
                    "All sprint tasks must be completed " +
                    "before closing the sprint. " +
                    "Completed: " +
                    completedTasks +
                    "/" +
                    totalTasks
            );
        }

        // -----------------------------------------------------
        // Update sprint status
        // -----------------------------------------------------

        sprint.setStatus("COMPLETED");

        Sprint savedSprint =
                sprintRepository.saveAndFlush(sprint);

        initializeProject(savedSprint);

        System.out.println(
                "NEW STATUS      = " +
                        savedSprint.getStatus()
        );

        System.out.println(
                "SPRINT COMPLETION SUCCESS"
        );

        System.out.println(
                "======================================"
        );
        System.out.println();

        return savedSprint;
    }

    // =========================================================
    // INITIALIZE PROJECT
    // =========================================================

    private void initializeProject(Sprint sprint) {

        if (sprint == null) {
            return;
        }

        if (sprint.getProject() != null) {

            sprint.getProject().getId();
            sprint.getProject().getName();
        }
    }

    // =========================================================
    // INITIALIZE PROJECTS
    // =========================================================

    private void initializeProject(List<Sprint> sprints) {

        if (sprints == null) {
            return;
        }

        sprints.forEach(this::initializeProject);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateSprintData(
            String name,
            LocalDate startDate,
            LocalDate endDate,
            Long projectId) {

        if (name == null ||
                name.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Sprint name is required"
            );
        }

        if (startDate == null) {

            throw new IllegalArgumentException(
                    "Start date is required"
            );
        }

        if (endDate == null) {

            throw new IllegalArgumentException(
                    "End date is required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        if (projectId == null) {

            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }
    }

    // =========================================================
    // NORMALIZE STATUS
    // =========================================================

    private String normalizeStatus(String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            return "PLANNED";
        }

        String normalized =
                status.trim().toUpperCase();

        if (!normalized.equals("PLANNED") &&
                !normalized.equals("ACTIVE") &&
                !normalized.equals("COMPLETED")) {

            throw new IllegalArgumentException(
                    "Sprint status must be PLANNED, " +
                    "ACTIVE, or COMPLETED"
            );
        }

        return normalized;
    }

    // =========================================================
    // STATUS TRANSITION
    // =========================================================

    private void validateStatusTransition(
            String currentStatus,
            String requestedStatus) {

        if (currentStatus == null ||
                currentStatus.trim().isEmpty()) {

            currentStatus = "PLANNED";
        }

        if (currentStatus.equalsIgnoreCase(
                requestedStatus)) {

            return;
        }

        if ("PLANNED".equalsIgnoreCase(currentStatus)
                && "ACTIVE".equalsIgnoreCase(
                        requestedStatus)) {

            return;
        }

        if ("ACTIVE".equalsIgnoreCase(currentStatus)
                && "COMPLETED".equalsIgnoreCase(
                        requestedStatus)) {

            return;
        }

        throw new IllegalStateException(
                "Invalid sprint status transition from "
                        + currentStatus
                        + " to "
                        + requestedStatus
        );
    }
}