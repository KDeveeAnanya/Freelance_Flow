package com.freelanceflow.backend.controller;

import com.freelanceflow.backend.entity.Invoice;
import com.freelanceflow.backend.entity.Payment;
import com.freelanceflow.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Map<String, Object> body) {
        Long projectId = Long.valueOf(body.get("projectId").toString());
        Double totalAmount = Double.valueOf(body.get("totalAmount").toString());
        String dueDate = body.get("dueDate") != null ? body.get("dueDate").toString() : null;
        return ResponseEntity.ok(invoiceService.createInvoice(projectId, totalAmount, dueDate));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Invoice>> getInvoices(@PathVariable Long projectId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByProject(projectId));
    }

    @PostMapping("/{invoiceId}/payments")
    public ResponseEntity<Payment> addPayment(@PathVariable Long invoiceId,
                                               @RequestBody Map<String, Object> body) {
        Double amount = Double.valueOf(body.get("amount").toString());
        String paymentMode = body.get("paymentMode").toString();
        String referenceId = body.get("referenceId").toString();
        String note = body.getOrDefault("note", "").toString();
        return ResponseEntity.ok(invoiceService.addPayment(invoiceId, amount,
                paymentMode, referenceId, note));
    }

    @GetMapping("/{invoiceId}/payments")
    public ResponseEntity<List<Payment>> getPayments(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(invoiceService.getPayments(invoiceId));
    }

    @PutMapping("/{invoiceId}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long invoiceId,
                                                 @RequestParam String status) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(invoiceId, status));
    }
}