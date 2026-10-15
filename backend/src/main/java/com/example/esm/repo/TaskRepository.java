package com.example.esm.repo;

import com.example.esm.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository
        extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByAssigneeId(Long assigneeId);

    boolean existsByColumnStateId(Long columnId);

    boolean existsByAssigneeId(Long assigneeId);

    List<Task> findByProjectIdAndSprintId(
            Long projectId,
            Long sprintId
    );

    long countBySprintId(Long sprintId);

    long countBySprintIdAndStatusIgnoreCase(Long sprintId, String status);
}