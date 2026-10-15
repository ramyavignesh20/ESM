package com.example.esm.controller;

import com.example.esm.entity.Notification;
import com.example.esm.entity.User;
import com.example.esm.repo.NotificationRepository;
import com.example.esm.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        return notificationRepository.findByIdAndUserId(id, user.getId())
                .map(notification -> {
                    notification.setRead(true);
                    return ResponseEntity.ok(notificationRepository.save(notification));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found"
                ));
    }
}
