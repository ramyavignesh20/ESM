package com.example.esm.repo;

import com.example.esm.entity.TaskColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {

    List<TaskColumn> findAllByOrderByPositionAsc();

    List<TaskColumn> findByProjectIdOrderByPositionAsc(Long projectId);

    boolean existsByProjectIdAndName(Long projectId, String name);
}