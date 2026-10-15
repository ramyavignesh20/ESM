package com.example.esm.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(

    @NotBlank
    String name,

    @NotBlank
    String projectKey,

    String description,

    String status
) {}