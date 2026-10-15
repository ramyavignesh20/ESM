package com.example.esm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ColumnRequest(

    @NotBlank
    String name,

    Integer position,

    @NotNull
    Long projectId
) {}