package com.freelanceflow.backend.controller;

import com.freelanceflow.backend.dto.ProjectRequest;
import com.freelanceflow.backend.entity.Project;
import com.freelanceflow.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> addProject(@RequestBody ProjectRequest request,
                                               Authentication auth) {
        return ResponseEntity.ok(projectService.addProject(request, auth.getName()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Project>> getProjects(@PathVariable Long clientId) {
        return ResponseEntity.ok(projectService.getProjectsByClient(clientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id,
                                                  @RequestBody ProjectRequest request,
                                                  Authentication auth) {
        return ResponseEntity.ok(projectService.updateProject(id, request, auth.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Project> updateStatus(@PathVariable Long id,
                                                 @RequestParam String status) {
        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted");
    }
}