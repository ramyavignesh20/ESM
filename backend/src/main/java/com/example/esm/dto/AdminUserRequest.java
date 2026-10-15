package com.example.esm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUserRequest(
        @NotBlank String username,
        String password,
        @NotBlank @Email String email,
        @NotBlank String mobile,
        @NotBlank String fullName,
        String role,
        Boolean active
) {}
