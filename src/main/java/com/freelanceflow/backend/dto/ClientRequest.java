package com.freelanceflow.backend.dto;
import lombok.Data;

@Data
public class ClientRequest {
    private String name;
    private String email;
    private String phone;
    private String companyName;
}