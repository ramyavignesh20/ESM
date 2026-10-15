
package com.example.esm.repo;

import com.example.esm.entity.Project;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository
        extends JpaRepository<Project, Long> {

    boolean existsByProjectKey(String projectKey);

    boolean existsByProjectKeyAndIdNot(
            String projectKey,
            Long id
    );

}