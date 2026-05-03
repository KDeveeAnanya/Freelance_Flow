package com.freelanceflow.backend.service;

import com.freelanceflow.backend.dto.ClientRequest;
import com.freelanceflow.backend.entity.Client;
import com.freelanceflow.backend.entity.User;
import com.freelanceflow.backend.repository.ClientRepository;
import com.freelanceflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Client addClient(ClientRequest request, String email) {
        User user = getUser(email);
        Client client = new Client();
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setCompanyName(request.getCompanyName());
        client.setUser(user);
        return clientRepository.save(client);
    }

    public List<Client> getClients(String email) {
        User user = getUser(email);
        return clientRepository.findByUserId(user.getId());
    }

    public Client updateClient(Long clientId, ClientRequest request, String email) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setCompanyName(request.getCompanyName());
        return clientRepository.save(client);
    }

    public void deleteClient(Long clientId, String email) {
        clientRepository.deleteById(clientId);
    }
}