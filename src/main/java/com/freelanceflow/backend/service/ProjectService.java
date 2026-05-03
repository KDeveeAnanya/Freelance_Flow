package com.freelanceflow.backend.service;

import com.freelanceflow.backend.dto.ProjectRequest;
import com.freelanceflow.backend.entity.Client;
import com.freelanceflow.backend.entity.Project;
import com.freelanceflow.backend.entity.ProjectStatus;
import com.freelanceflow.backend.repository.ClientRepository;
import com.freelanceflow.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;

    public Project addProject(ProjectRequest request, String email) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setTotalAmount(request.getTotalAmount());
        project.setStartDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : null);
        project.setDueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setClient(client);
        return projectRepository.save(project);
    }

    public List<Project> getProjectsByClient(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    public Project updateStatus(Long projectId, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(ProjectStatus.valueOf(status));
        return projectRepository.save(project);
    }

    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }
}