package com.example.esm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskRequest(

        @NotNull
        Long projectId,

        Long columnId,

        Long sprintId,

        Long assigneeId,

        @NotBlank
        String title,

        String description,

        String priority,

        String status,

        LocalDate dueDate

) {
}