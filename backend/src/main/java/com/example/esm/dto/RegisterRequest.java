package com.example.esm.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(

    @NotBlank
    String username,

    @NotBlank
    String password,

    @NotBlank
    @Email
    String email,

    @NotBlank
    String mobile,

    @NotBlank
    String fullName
) {}