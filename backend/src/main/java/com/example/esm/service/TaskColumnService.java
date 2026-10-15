package com.example.esm.service;

import com.example.esm.entity.Project;
import com.example.esm.entity.TaskColumn;
import com.example.esm.repo.ProjectRepository;
import com.example.esm.repo.TaskColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskColumnService {

    private final TaskColumnRepository taskColumnRepository;
    private final ProjectRepository projectRepository;

    // =========================================================
    // GET ALL COLUMNS
    // =========================================================
    @Transactional(readOnly = true)
    public List<TaskColumn> getAllColumns() {

        return taskColumnRepository.findAll();
    }

    // =========================================================
    // GET COLUMN BY ID
    // =========================================================
    @Transactional(readOnly = true)
    public TaskColumn getColumnById(Long id) {

        return taskColumnRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Task column not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET COLUMNS BY PROJECT
    // =========================================================
    @Transactional(readOnly = true)
    public List<TaskColumn> getColumnsByProject(Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            throw new RuntimeException(
                    "Project not found with id: " + projectId
            );
        }

        return taskColumnRepository
                .findByProjectIdOrderByPositionAsc(projectId);
    }

    // =========================================================
    // CREATE COLUMN
    // =========================================================
    public TaskColumn createColumn(
            String name,
            Integer position,
            Long projectId) {

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Column name is required"
            );
        }

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID is required"
            );
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found with id: " + projectId
                        )
                );

        TaskColumn column = TaskColumn.builder()
                .name(name.trim())
                .position(position != null ? position : 0)
                .project(project)
                .build();

        return taskColumnRepository.save(column);
    }

    // =========================================================
    // UPDATE COLUMN
    // =========================================================
    public TaskColumn updateColumn(
            Long id,
            String name,
            Integer position,
            Long projectId) {

        TaskColumn existingColumn =
                taskColumnRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Task column not found with id: " + id
                                )
                        );

        if (name != null && !name.trim().isEmpty()) {
            existingColumn.setName(name.trim());
        }

        if (position != null) {
            existingColumn.setPosition(position);
        }

        if (projectId != null) {

            Project project =
                    projectRepository.findById(projectId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Project not found with id: "
                                                    + projectId
                                    )
                            );

            existingColumn.setProject(project);
        }

        return taskColumnRepository.save(existingColumn);
    }

    // =========================================================
    // DELETE COLUMN
    // =========================================================
    public void deleteColumn(Long id) {

        if (!taskColumnRepository.existsById(id)) {
            throw new RuntimeException(
                    "Task column not found with id: " + id
            );
        }

        taskColumnRepository.deleteById(id);
    }
}