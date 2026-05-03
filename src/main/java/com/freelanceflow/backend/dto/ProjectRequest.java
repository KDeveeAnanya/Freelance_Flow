package com.freelanceflow.backend.dto;
import lombok.Data;

@Data
public class ProjectRequest {
    private String title;
    private String description;
    private Double totalAmount;
    private String startDate;
    private String dueDate;
    private Long clientId;
}