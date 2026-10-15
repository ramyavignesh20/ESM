package com.example.esm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SprintRequest(

        @NotBlank(message = "Sprint name is required")
        String name,

        String goal,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        String status,

        @NotNull(message = "Project ID is required")
        Long projectId

) {
}