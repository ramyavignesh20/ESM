package com.example.esm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 100)
    private String type;

    private Long taskId;

    @Column(nullable = false)
    private boolean isRead;

    @Column(nullable = false)
    private boolean emailSent;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Notification(Long userId, String message, String type, Long taskId) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.taskId = taskId;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
