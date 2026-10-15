package com.example.esm.controller;

import com.example.esm.entity.Task;
import com.example.esm.entity.TaskColumn;
import com.example.esm.entity.User;
import com.example.esm.repo.SprintRepository;
import com.example.esm.repo.TaskColumnRepository;
import com.example.esm.repo.TaskRepository;
import com.example.esm.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public User getCurrentUser(
            Authentication authentication
    ) {

        return userRepository
                .findByUsername(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileRequest request,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow();

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email().trim());
        }
        if (request.mobile() != null && !request.mobile().isBlank()) {
            user.setMobile(request.mobile().trim());
        }
        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 6 characters."));
            }
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.profileLogo() != null) {
            user.setProfileLogo(request.profileLogo().isBlank()
                    ? null
                    : request.profileLogo());
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    public record ProfileRequest(
            String fullName,
            String email,
            String mobile,
            String password,
            String profileLogo) {}

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(
            Authentication authentication
    ) {

        User user =
                userRepository
                        .findByUsername(
                                authentication.getName()
                        )
                        .orElseThrow();

        List<Task> tasks =
                taskRepository
                        .findByAssigneeId(
                                user.getId()
                        );

        Map<String, Object> result =
                new HashMap<>();

        result.put(
                "userName",
                user.getUsername()
        );

        result.put(
                "fullName",
                user.getFullName()
        );

        result.put(
                "myTasks",
                tasks
        );

        result.put(
                "sprintCount",
                sprintRepository.count()
        );

        result.put(
                "boardColumns",
                tasks.stream()
                        .map(Task::getProject)
                        .filter(project -> project != null)
                        .map(project -> project.getId())
                        .distinct()
                        .flatMap(projectId -> taskColumnRepository
                                .findByProjectIdOrderByPositionAsc(projectId)
                                .stream())
                        .collect(Collectors.toList())
        );

        return result;
    }

    @PutMapping("/tasks/{taskId}/progress")
    public ResponseEntity<?> updateTaskProgress(
            @PathVariable Long taskId,
            @RequestBody ProgressRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow();

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        if (task.getAssignee() == null ||
                !task.getAssignee().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of(
                    "message", "You can only update progress for your own tasks."
            ));
        }

        if (request == null || request.columnId() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "A workflow column is required."
            ));
        }

        TaskColumn column = taskColumnRepository.findById(request.columnId()).orElse(null);
        if (column == null ||
                task.getProject() == null ||
                !column.getProject().getId().equals(task.getProject().getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "The selected workflow column is invalid for this task."
            ));
        }

        task.setColumnState(column);
        if (request.status() != null && !request.status().isBlank()) {
            task.setStatus(request.status().trim().toUpperCase());
        }

        return ResponseEntity.ok(taskRepository.save(task));
    }

    public record ProgressRequest(Long columnId, String status) {}

    @GetMapping("/active")
public ResponseEntity<List<User>> getActiveUsers() {

    return ResponseEntity.ok(
            userRepository.findByActiveTrue()
    );
}
}