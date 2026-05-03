package com.freelanceflow.backend.service;

import com.freelanceflow.backend.entity.*;
import com.freelanceflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;

    public Invoice createInvoice(Long projectId, Double totalAmount, String dueDate) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Invoice invoice = new Invoice();
        invoice.setProject(project);
        invoice.setTotalAmount(totalAmount);
        invoice.setAmountPaid(0.0);
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setDueDate(dueDate != null ? LocalDate.parse(dueDate) : null);
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getInvoicesByProject(Long projectId) {
        return invoiceRepository.findByProjectId(projectId);
    }

    public Payment addPayment(Long invoiceId, Double amount,
                               String paymentMode, String referenceId, String note) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMode(PaymentMode.valueOf(paymentMode));
        payment.setReferenceId(referenceId);
        payment.setNote(note);
        payment.setPaymentDate(LocalDate.now());
        paymentRepository.save(payment);

        // update amount paid on invoice
        double totalPaid = paymentRepository.findByInvoiceId(invoiceId)
                .stream().mapToDouble(Payment::getAmount).sum();
        invoice.setAmountPaid(totalPaid);
        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);
        return payment;
    }

    public List<Payment> getPayments(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    public Invoice updateInvoiceStatus(Long invoiceId, String status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.valueOf(status));
        return invoiceRepository.save(invoice);
    }
}