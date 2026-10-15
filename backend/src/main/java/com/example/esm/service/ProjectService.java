
package com.example.esm.service;

import com.example.esm.entity.Project;
import com.example.esm.repo.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    // Get all projects
    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get project by ID
    @Transactional(readOnly = true)
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found with ID: " + id
                        )
                );
    }

    // Create project
    public Project createProject(Project project) {

        if (project == null) {
            throw new IllegalArgumentException(
                    "Project data is required"
            );
        }

        if (project.getName() == null ||
                project.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Project name is required"
            );
        }

        return projectRepository.save(project);
    }

    // Update project
    public Project updateProject(
            Long id,
            Project updatedProject
    ) {

        Project existingProject = getProjectById(id);

        if (updatedProject.getName() != null &&
                !updatedProject.getName().trim().isEmpty()) {

            existingProject.setName(
                    updatedProject.getName().trim()
            );
        }

        if (updatedProject.getProjectKey() != null &&
                !updatedProject.getProjectKey().trim().isEmpty()) {

            existingProject.setProjectKey(
                    updatedProject.getProjectKey().trim()
            );
        }

        if (updatedProject.getStatus() != null) {

            existingProject.setStatus(
                    updatedProject.getStatus()
            );
        }

        return projectRepository.save(existingProject);
    }

    // Delete project
    public void deleteProject(Long id) {

        if (!projectRepository.existsById(id)) {

            throw new RuntimeException(
                    "Project not found with ID: " + id
            );
        }

        projectRepository.deleteById(id);
    }
}