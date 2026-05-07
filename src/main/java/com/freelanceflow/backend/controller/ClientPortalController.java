package com.freelanceflow.backend.controller;

import com.freelanceflow.backend.entity.Invoice;
import com.freelanceflow.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientPortalController {

    private final InvoiceService invoiceService;

    // Client opens this link — sees project + invoice details
    // No auth needed — public endpoint
    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPortalDetails(
            @PathVariable String token) {
        Invoice invoice = invoiceService.getInvoiceByToken(token);
        
        return ResponseEntity.ok(Map.of(
            "invoiceNumber",   invoice.getInvoiceNumber(),
            "totalAmount",     invoice.getTotalAmount(),
            "dueDate",         invoice.getDueDate(),
            "projectTitle",    invoice.getProject().getTitle(),
            "projectDesc",     invoice.getProject().getDescription(),
            "clientName",      invoice.getProject().getClient().getName(),
            "freelancerName",  invoice.getProject().getClient().getUser().getName(),
            "confirmed",       invoice.getClientConfirmed(),
            "status",          invoice.getStatus()
        ));
    }

    // Client clicks "I Agree" — confirms the project
    @PostMapping("/{token}/confirm")
    public ResponseEntity<Map<String, Object>> confirmProject(
            @PathVariable String token) {
        Invoice invoice = invoiceService.confirmByClient(token);
        
        return ResponseEntity.ok(Map.of(
            "message",   "Project confirmed successfully!",
            "confirmed", invoice.getClientConfirmed(),
            "status",    invoice.getStatus()
        ));
    }
}