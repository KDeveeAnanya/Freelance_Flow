package com.freelanceflow.backend.controller;

import com.freelanceflow.backend.dto.ClientRequest;
import com.freelanceflow.backend.entity.Client;
import com.freelanceflow.backend.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<Client> addClient(@RequestBody ClientRequest request,
                                             Authentication auth) {
        return ResponseEntity.ok(clientService.addClient(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Client>> getClients(Authentication auth) {
        return ResponseEntity.ok(clientService.getClients(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id,
                                                @RequestBody ClientRequest request,
                                                Authentication auth) {
        return ResponseEntity.ok(clientService.updateClient(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable Long id,
                                                Authentication auth) {
        clientService.deleteClient(id, auth.getName());
        return ResponseEntity.ok("Client deleted");
    }
}