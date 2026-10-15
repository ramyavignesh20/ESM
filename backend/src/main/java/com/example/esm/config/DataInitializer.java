package com.example.esm.config;

import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.TaskColumnRepository;
import com.example.esm.repo.TaskRepository;
import com.example.esm.repo.SprintRepository;
import com.example.esm.entity.Project;
import com.example.esm.entity.TaskColumn;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProjectRepository projectRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.delete-default-projects:false}")
    private boolean deleteDefaultProjects;

    @Bean
    CommandLineRunner initializeAdmin() {
        return args -> {
            if (deleteDefaultProjects) {
                taskRepository.deleteAllInBatch();
                sprintRepository.deleteAllInBatch();
                taskColumnRepository.deleteAllInBatch();
                projectRepository.deleteAllInBatch();
            }

            User admin = userRepository.findByUsername("admin")
                    .orElseGet(() -> User.builder()
                            .username("admin")
                            .email("admin@esm.local")
                            .mobile("0000000000")
                            .fullName("System Administrator")
                            .build());

            boolean changed = false;
            if (admin.getPassword() == null
                    || !passwordEncoder.matches(adminPassword, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                changed = true;
            }
            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                admin.setRole("ADMIN");
                changed = true;
            }
            if (!admin.isActive()) {
                admin.setActive(true);
                changed = true;
            }
            if (admin.getEmail() == null || admin.getEmail().isBlank()) {
                admin.setEmail("admin@esm.local");
                changed = true;
            }
            if (admin.getFullName() == null || admin.getFullName().isBlank()) {
                admin.setFullName("System Administrator");
                changed = true;
            }
            if (changed || admin.getId() == null) {
                userRepository.save(admin);
            }

            String[] defaults = {"To Do", "In Progress", "Testing", "Done"};
            for (Project project : projectRepository.findAll()) {
                for (int i = 0; i < defaults.length; i++) {
                    if (!taskColumnRepository.existsByProjectIdAndName(project.getId(), defaults[i])) {
                        taskColumnRepository.save(TaskColumn.builder()
                                .name(defaults[i])
                                .position(i)
                                .project(project)
                                .build());
                    }
                }
            }
        };
    }
}