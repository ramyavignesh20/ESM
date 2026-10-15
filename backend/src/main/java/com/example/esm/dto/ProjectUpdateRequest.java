package com.example.esm.dto;

import lombok.Data;

@Data
public class ProjectUpdateRequest {

    private String name;

    private String projectKey;

    private String status;
}