package com.freelanceflow.backend.service;

import com.freelanceflow.backend.entity.*;
import com.freelanceflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import java.io.ByteArrayOutputStream;

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
        invoice.setPortalToken(UUID.randomUUID().toString());
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getInvoicesByProject(Long projectId) {
        return invoiceRepository.findByProjectId(projectId);
    }

    // ─── NEW: Update invoice ────────────────────────────────────────────────
    public Invoice updateInvoice(Long invoiceId, Double totalAmount,
                                  String dueDate, String status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (totalAmount != null) {
            invoice.setTotalAmount(totalAmount);
            // Recalculate status based on new total
            double paid = invoice.getAmountPaid();
            if (paid >= totalAmount) {
                invoice.setStatus(InvoiceStatus.PAID);
            } else if (paid > 0) {
                invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            }
        }

        if (dueDate != null) {
            invoice.setDueDate(LocalDate.parse(dueDate));
        }

        // Manual status override (only if no payment conflict)
        if (status != null && invoice.getAmountPaid() == 0) {
            invoice.setStatus(InvoiceStatus.valueOf(status));
        }

        return invoiceRepository.save(invoice);
    }

    // ─── NEW: Delete invoice ────────────────────────────────────────────────
    public void deleteInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        paymentRepository.deleteAll(paymentRepository.findByInvoiceId(invoiceId));
        invoiceRepository.delete(invoice);
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

    public Invoice getInvoiceByToken(String token) {
        return invoiceRepository.findByPortalToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired link"));
    }

    public Invoice confirmByClient(String token) {
        Invoice invoice = invoiceRepository.findByPortalToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid link"));

        if (invoice.getClientConfirmed()) {
            throw new RuntimeException("Already confirmed");
        }

        invoice.setClientConfirmed(true);
        invoice.setConfirmedAt(LocalDateTime.now());
        invoice.setStatus(InvoiceStatus.SENT);
        return invoiceRepository.save(invoice);
    }

    public byte[] generateInvoicePdf(Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font smallFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.GRAY);

        document.add(new Paragraph("INVOICE", titleFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Invoice Number : " + invoice.getInvoiceNumber(), boldFont));
        document.add(new Paragraph("Status         : " + invoice.getStatus(), normalFont));
        document.add(new Paragraph("Due Date       : " + invoice.getDueDate(), normalFont));
        document.add(new Paragraph("Created At     : " + invoice.getCreatedAt().toLocalDate(), normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("From (Freelancer)", boldFont));
        document.add(new Paragraph(invoice.getProject().getClient().getUser().getName(), normalFont));
        document.add(new Paragraph(invoice.getProject().getClient().getUser().getEmail(), smallFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("To (Client)", boldFont));
        document.add(new Paragraph(invoice.getProject().getClient().getName(), normalFont));
        document.add(new Paragraph(invoice.getProject().getClient().getEmail(), smallFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Project Details", boldFont));
        document.add(new Paragraph("Title       : " + invoice.getProject().getTitle(), normalFont));
        document.add(new Paragraph("Description : " + invoice.getProject().getDescription(), normalFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.addCell(new PdfPCell(new Phrase("Total Amount", boldFont)));
        table.addCell(new PdfPCell(new Phrase("₹ " + invoice.getTotalAmount(), normalFont)));
        table.addCell(new PdfPCell(new Phrase("Amount Paid", boldFont)));
        table.addCell(new PdfPCell(new Phrase("₹ " + invoice.getAmountPaid(), normalFont)));
        table.addCell(new PdfPCell(new Phrase("Balance Due", boldFont)));
        table.addCell(new PdfPCell(new Phrase("₹ " + (invoice.getTotalAmount() - invoice.getAmountPaid()), boldFont)));
        document.add(table);
        document.add(new Paragraph(" "));

        if (invoice.getClientConfirmed()) {
            document.add(new Paragraph("✓ Client confirmed this invoice on " +
                    invoice.getConfirmedAt().toLocalDate(), smallFont));
        }

        document.close();
        return out.toByteArray();
    }
}