package com.example.esm.dto;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long senderId,
        String senderName,
        String senderRole,
        String content,
        LocalDateTime sentAt
) {
}
