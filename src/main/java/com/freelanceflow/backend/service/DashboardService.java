package com.freelanceflow.backend.service;

import com.freelanceflow.backend.entity.Payment;
import com.freelanceflow.backend.entity.User;
import com.freelanceflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final PaymentRepository paymentRepository;

    public Map<String, Object> getSummary(User user) {
        long totalClients = clientRepository.findByUser(user).size();
        long totalProjects = projectRepository.findByClient_User(user).size();

        long activeProjects = projectRepository.findByClient_User(user)
                .stream()
                .filter(p -> p.getStatus().name().equals("ACTIVE"))
                .count();

        double totalEarnings = paymentRepository.findAll()
                .stream()
                .filter(p -> p.getInvoice().getProject().getClient().getUser().getId()
                        .equals(user.getId()))
                .mapToDouble(Payment::getAmount)
                .sum();

        long pendingInvoices = invoiceRepository.findAll()
                .stream()
                .filter(i -> i.getProject().getClient().getUser().getId().equals(user.getId()))
                .filter(i -> !i.getStatus().name().equals("PAID"))
                .count();

        return Map.of(
            "totalClients",    totalClients,
            "totalProjects",   totalProjects,
            "activeProjects",  activeProjects,
            "totalEarnings",   totalEarnings,
            "pendingInvoices", pendingInvoices
        );
    }
}