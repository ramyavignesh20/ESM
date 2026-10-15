
package com.example.esm.repo;

import com.example.esm.entity.Sprint;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    /*
     * Fetch the Project together with the Sprint.
     *
     * This prevents:
     * Could not initialize proxy [Project#...] - no session
     * when Spring/Jackson converts Sprint entities to JSON.
     */
    @Override
    @EntityGraph(attributePaths = {"project"})
    List<Sprint> findAll();

    /*
     * Fetch Project when loading a sprint by ID.
     */
    @Override
    @EntityGraph(attributePaths = {"project"})
    Optional<Sprint> findById(Long id);

    /*
     * Get all sprints for a project with Project loaded.
     */
    @EntityGraph(attributePaths = {"project"})
    List<Sprint> findByProjectId(Long projectId);

    /*
     * Get project sprints ordered by newest start date first.
     */
    @EntityGraph(attributePaths = {"project"})
    List<Sprint> findByProjectIdOrderByStartDateDesc(Long projectId);

    /*
     * Get project sprints ordered by oldest start date first.
     */
    @EntityGraph(attributePaths = {"project"})
    List<Sprint> findByProjectIdOrderByStartDateAsc(Long projectId);

    /*
     * Get the latest active sprint for a project.
     */
    @EntityGraph(attributePaths = {"project"})
    Optional<Sprint> findFirstByProjectIdAndStatusIgnoreCaseOrderByStartDateDesc(
            Long projectId,
            String status
    );
}
