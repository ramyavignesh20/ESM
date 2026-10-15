package com.example.esm.controller;

import com.example.esm.dto.ChatMessageRequest;
import com.example.esm.dto.ChatMessageResponse;
import com.example.esm.entity.ChatMessage;
import com.example.esm.entity.User;
import com.example.esm.repo.ChatMessageRepository;
import com.example.esm.repo.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/chat/messages")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getMessages() {
        List<ChatMessageResponse> messages = chatMessageRepository
                .findTop100ByOrderBySentAtDesc()
                .stream()
                .sorted(Comparator.comparing(ChatMessage::getSentAt))
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication
    ) {
        User sender = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found"
                ));

        ChatMessage message = new ChatMessage();
        message.setSenderId(sender.getId());
        message.setSenderName(sender.getFullName() == null
                ? sender.getUsername()
                : sender.getFullName());
        message.setSenderRole(sender.getRole());
        message.setContent(request.content().trim());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(chatMessageRepository.save(message)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found"
                ));
        ChatMessage message = chatMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Chat message was not found"
                ));
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin && !message.getSenderId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own messages"
            );
        }

        chatMessageRepository.delete(message);
        return ResponseEntity.noContent().build();
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSenderId(),
                message.getSenderName(),
                message.getSenderRole(),
                message.getContent(),
                message.getSentAt()
        );
    }
}
