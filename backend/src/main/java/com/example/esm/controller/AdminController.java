package com.example.esm.controller;

import com.example.esm.dto.AdminUserRequest;
import com.example.esm.dto.AdminUserResponse;
import com.example.esm.dto.ColumnRequest;
import com.example.esm.entity.Project;
import com.example.esm.entity.TaskColumn;
import com.example.esm.entity.User;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.SprintRepository;
import com.example.esm.repo.TaskColumnRepository;
import com.example.esm.repo.TaskRepository;
import com.example.esm.repo.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<AdminUserResponse> getProfile(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .map(AdminUserResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileRequest request,
            Authentication authentication) {
        User admin = userRepository.findByUsername(authentication.getName())
                .orElseThrow();
        if (request.fullName() != null && !request.fullName().isBlank()) {
            admin.setFullName(request.fullName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            admin.setEmail(request.email().trim());
        }
        if (request.mobile() != null && !request.mobile().isBlank()) {
            admin.setMobile(request.mobile().trim());
        }
        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must be at least 6 characters."));
            }
            admin.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.profileLogo() != null) {
            admin.setProfileLogo(request.profileLogo().isBlank()
                    ? null
                    : request.profileLogo());
        }
        return ResponseEntity.ok(AdminUserResponse.from(userRepository.save(admin)));
    }

    public record ProfileRequest(
            String fullName,
            String email,
            String mobile,
            String password,
            String profileLogo) {}

    // =========================================================
    // ADMIN DASHBOARD
    // GET /api/admin/dashboard
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        Map<String, Long> taskProcess = taskRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        task -> normalizeProcessName(
                                task.getColumnState() == null
                                        ? task.getStatus()
                                        : task.getColumnState().getName()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return ResponseEntity.ok(
                Map.of(
                        "message", "Admin dashboard",
                        "projects", projectRepository.count(),
                        "sprints", sprintRepository.count(),
                        "tasks", taskRepository.count(),
                        "users", userRepository.count(),
                        "taskProcess", taskProcess
                )
        );
    }

    private String normalizeProcessName(String value) {
        if (value == null || value.isBlank()) {
            return "Planning";
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("done") || normalized.equals("complete") ||
                normalized.equals("completed")) {
            return "Complete";
        }
        if (normalized.contains("test")) return "Testing";
        if (normalized.contains("cod")) return "Coding";
        if (normalized.contains("design")) return "Design";
        return "Planning";
    }

    // =========================================================
    // TASK COLUMN APIs
    // =========================================================

    // POST /api/admin/columns
    @PostMapping("/columns")
    public ResponseEntity<TaskColumn> createColumn(
            @Valid @RequestBody ColumnRequest request) {

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));

        String name = request.name().trim();

        if (taskColumnRepository.existsByProjectIdAndName(
                request.projectId(),
                name
        )) {
            return ResponseEntity.badRequest().build();
        }

        TaskColumn column = TaskColumn.builder()
                .name(name)
                .position(
                        request.position() == null
                                ? 0
                                : request.position()
                )
                .project(project)
                .build();

        TaskColumn savedColumn = taskColumnRepository.save(column);

        return ResponseEntity
                .status(201)
                .body(savedColumn);
    }

    // PUT /api/admin/columns/{id}
    @PutMapping("/columns/{id}")
    public ResponseEntity<TaskColumn> updateColumn(
            @PathVariable Long id,
            @Valid @RequestBody ColumnRequest request) {

        return taskColumnRepository.findById(id)
                .map(column -> {

                    String name = request.name().trim();

                    boolean projectChanged =
                            !column.getProject()
                                    .getId()
                                    .equals(request.projectId());

                    boolean duplicateName =
                            taskColumnRepository.existsByProjectIdAndName(
                                    request.projectId(),
                                    name
                            );

                    boolean renamingExistingColumn =
                            !column.getName()
                                    .equalsIgnoreCase(name);

                    if (projectChanged ||
                            (duplicateName && renamingExistingColumn)) {

                        throw new IllegalArgumentException(
                                "Column name must be unique within its project"
                        );
                    }

                    column.setName(name);

                    if (request.position() != null) {
                        column.setPosition(request.position());
                    }

                    TaskColumn updatedColumn =
                            taskColumnRepository.save(column);

                    return ResponseEntity.ok(updatedColumn);
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // DELETE /api/admin/columns/{id}
    @DeleteMapping("/columns/{id}")
    public ResponseEntity<Void> deleteColumn(
            @PathVariable Long id) {

        if (!taskColumnRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (taskRepository.existsByColumnStateId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete a column that contains tasks. "
                            + "Move or remove the tasks first."
            );
        }

        taskColumnRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // USER MANAGEMENT APIs
    // =========================================================

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

        List<AdminUserResponse> users =
                userRepository.findAll()
                        .stream()
                        .map(AdminUserResponse::from)
                        .toList();

        return ResponseEntity.ok(users);
    }

    // GET /api/admin/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUser(
            @PathVariable Long id) {

        return userRepository.findById(id)
                .map(AdminUserResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // POST /api/admin/users
    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> createUser(
            @Valid @RequestBody AdminUserRequest request) {

        validateNewUser(request);

        User user = User.builder()
                .username(request.username().trim())
                .password(
                        passwordEncoder.encode(request.password())
                )
                .email(request.email().trim())
                .mobile(request.mobile().trim())
                .fullName(request.fullName().trim())
                .role(normalizeRole(request.role()))
                .active(
                        request.active() == null
                                || request.active()
                )
                .build();

        User savedUser = userRepository.save(user);

        return ResponseEntity
                .status(201)
                .body(AdminUserResponse.from(savedUser));
    }

    // PUT /api/admin/users/{id}
    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserRequest request) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        validateUniqueUserFields(request, id);

        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim());
        user.setMobile(request.mobile().trim());
        user.setFullName(request.fullName().trim());
        user.setRole(normalizeRole(request.role()));

        if (request.password() != null
                && !request.password().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.password())
            );
        }

        if (request.active() != null) {
            user.setActive(request.active());
        }

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(
                AdminUserResponse.from(updatedUser)
        );
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (taskRepository.existsByAssigneeId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete a user assigned to tasks. "
                            + "Reassign the tasks first."
            );
        }

        userRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // USER VALIDATION HELPERS
    // =========================================================

    private void validateNewUser(AdminUserRequest request) {

        if (request.password() == null
                || request.password().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        validateUniqueUserFields(request, null);
    }

    private void validateUniqueUserFields(
            AdminUserRequest request,
            Long ignoredId) {

        String username = request.username().trim();
        String email = request.email().trim();
        String mobile = request.mobile().trim();

        userRepository.findByUsername(username)
                .ifPresent(existing -> {

                    if (!existing.getId().equals(ignoredId)) {
                        throw new IllegalArgumentException(
                                "Username already exists"
                        );
                    }
                });

        userRepository.findByEmail(email)
                .ifPresent(existing -> {

                    if (!existing.getId().equals(ignoredId)) {
                        throw new IllegalArgumentException(
                                "Email already exists"
                        );
                    }
                });

        if (userRepository.existsByMobile(mobile)) {

            User existing =
                    userRepository.findByMobile(mobile)
                            .orElse(null);

            if (existing == null
                    || !existing.getId().equals(ignoredId)) {

                throw new IllegalArgumentException(
                        "Mobile number already exists"
                );
            }
        }
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "USER";
        }

        String normalized = role.trim().toUpperCase();

        if (normalized.startsWith("ROLE_")) {
            return normalized.substring("ROLE_".length());
        }

        return normalized;
    }

    // =========================================================
    // HEALTH CHECK
    // GET /api/admin/health
    // =========================================================

    @GetMapping("/health")
    public ResponseEntity<?> health() {

        return ResponseEntity.ok(
                Map.of(
                        "status", "UP",
                        "message", "Admin API is working"
                )
        );
    }
}