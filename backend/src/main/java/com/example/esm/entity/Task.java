
package com.example.esm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "tasks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_task_key",
            columnNames = "task_key"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({
    "hibernateLazyInitializer",
    "handler"
})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "task_key",
        length = 30
    )
    private String taskKey;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "TODO";

    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "assignee_id",
        foreignKey = @ForeignKey(name = "fk_task_assignee")
    )
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler",
        "password"
    })
    private User assignee;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "project_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_task_project")
    )
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
    })
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "sprint_id",
        foreignKey = @ForeignKey(name = "fk_task_sprint")
    )
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
    })
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "column_state_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_task_column")
    )
    @JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
    })
    private TaskColumn columnState;
}