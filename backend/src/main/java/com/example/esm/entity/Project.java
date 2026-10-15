package com.example.esm.entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "projects",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_project_key",
            columnNames = "project_key"
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
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "project_key", nullable = false, unique = true, length = 50)
    private String projectKey;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";
}