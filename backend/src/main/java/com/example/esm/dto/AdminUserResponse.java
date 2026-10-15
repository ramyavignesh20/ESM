package com.example.esm.dto;

import com.example.esm.entity.User;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String mobile,
        String fullName,
        String profileLogo,
        String role,
        boolean active
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getMobile(),
                user.getFullName(),
                user.getProfileLogo(),
                user.getRole(),
                user.isActive()
        );
    }
}
