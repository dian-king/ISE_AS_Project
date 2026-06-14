package com.iseas.ise_as_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Email delivery service.
 * Primary: SMTP via Spring JavaMailSender (Gmail / custom SMTP).
 * Fallback: SendGrid HTTP API — used when SMTP is unconfigured or fails.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    // SendGrid fallback
    @Value("${sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:noreply@igaafriqa.rw}")
    private String sendGridFromEmail;

    @Value("${sendgrid.from-name:iga afriqa Admissions}")
    private String sendGridFromName;

    public void sendStatusUpdateEmail(String to, String studentName, String status) {
        String subject = "Application Status Update — " + studentName;
        String body = String.format(
            "Dear Parent,\n\n" +
            "This is an update regarding the application for %s.\n" +
            "The current status has been updated to: %s.\n\n" +
            "Log in to the admissions portal to see full details:\n%s/dashboard\n\n" +
            "Best regards,\nAdmissions Team",
            studentName, status, baseUrl
        );
        send(to, subject, body);
    }

    public void sendVerificationEmail(String to, String token) {
        String link = baseUrl + "/verify-email?token=" + token;
        String subject = "Verify your email — iga afriqa Admissions";
        String body = String.format(
            "Welcome to the iga afriqa Admissions Portal.\n\n" +
            "Please verify your email address by clicking the link below:\n%s\n\n" +
            "This link expires in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "Best regards,\nAdmissions Team",
            link
        );
        send(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = baseUrl + "/reset-password?token=" + token;
        String subject = "Reset your password — iga afriqa Admissions";
        String body = String.format(
            "You requested a password reset for your iga afriqa Admissions account.\n\n" +
            "Click the link below to set a new password:\n%s\n\n" +
            "This link expires in 1 hour. If you did not request a reset, please ignore this email.\n\n" +
            "Best regards,\nAdmissions Team",
            link
        );
        send(to, subject, body);
    }

    public void sendSubmissionConfirmationEmail(String to, String studentName, String applicationNumber) {
        String subject = "Application Received — " + studentName;
        String body = String.format(
            "Dear Parent,\n\n" +
            "We have successfully received the admissions application for %s.\n\n" +
            "Application Reference: %s\n\n" +
            "Our admissions team will review your application and documents and be in touch within 5–7 business days.\n\n" +
            "You can track the status of your application at any time by logging into the portal:\n%s/dashboard\n\n" +
            "Best regards,\nAdmissions Team",
            studentName, applicationNumber, baseUrl
        );
        send(to, subject, body);
    }

    public void sendEnrollmentConfirmationEmail(String to, String parentName, String studentName,
                                                  String studentNumber, String grade, String year) {
        String subject = "Enrollment Confirmed — " + studentName;
        String body = String.format(
            "Dear %s,\n\n" +
            "We are pleased to confirm that the enrollment of %s has been successfully completed.\n\n" +
            "Student Number : %s\n" +
            "Programme      : %s\n" +
            "Academic Year  : %s\n\n" +
            "Please quote the student number in all future correspondence with the school.\n\n" +
            "You can view the full enrollment record by logging into the portal:\n%s/dashboard\n\n" +
            "We look forward to welcoming %s.\n\n" +
            "Best regards,\nRegistrar's Office",
            parentName, studentName, studentNumber, grade, year, baseUrl, studentName
        );
        send(to, subject, body);
    }

    public void sendDecisionEmail(String to, String parentName, String studentName,
                                   String decision, String letterContent) {
        String subject = "Admissions Decision — " + studentName;
        String body = String.format(
            "Dear %s,\n\n" +
            "A formal admissions decision has been recorded for %s.\n" +
            "Decision: %s\n\n" +
            "──────────────────────────────────────────\n" +
            "%s\n" +
            "──────────────────────────────────────────\n\n" +
            "Log in to the portal to view your full decision letter and next steps:\n%s/dashboard\n\n" +
            "Best regards,\nAdmissions Team",
            parentName, studentName, decision, letterContent, baseUrl
        );
        send(to, subject, body);
    }

    public void sendInterviewInvitationEmail(String to, String recipientName, String studentName,
                                               String dateTime, String mode, String location) {
        String subject = "Interview Invitation — " + studentName;
        String body = String.format(
            "Dear %s,\n\n" +
            "An interview has been scheduled regarding the admissions application for %s.\n\n" +
            "Date & Time : %s\n" +
            "Mode        : %s\n" +
            "Location    : %s\n\n" +
            "Please log in to the admissions portal for further details:\n%s/dashboard\n\n" +
            "Best regards,\nAdmissions Team",
            recipientName, studentName, dateTime, mode, location, baseUrl
        );
        send(to, subject, body);
    }

    /** Public surface for template-driven notifications. */
    public void sendRaw(String to, String subject, String body) {
        send(to, subject, body);
    }

    private void send(String to, String subject, String body) {
        // Try SMTP first if a username is configured
        if (smtpUsername != null && !smtpUsername.isBlank()
                && !smtpUsername.equals("your-email@gmail.com")) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Email sent via SMTP to {}: {}", to, subject);
                return;
            } catch (Exception e) {
                log.warn("SMTP send failed for {} ({}), trying SendGrid fallback", to, e.getMessage());
            }
        }

        // SendGrid fallback
        if (sendGridApiKey != null && !sendGridApiKey.isBlank()) {
            sendViaSendGrid(to, subject, body);
        } else {
            log.info("Email not delivered (no provider configured) — would have sent to {}: {}", to, subject);
        }
    }

    @SuppressWarnings("unchecked")
    private void sendViaSendGrid(String to, String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(sendGridApiKey);

            Map<String, Object> payload = Map.of(
                "from", Map.of("email", sendGridFromEmail, "name", sendGridFromName),
                "personalizations", new Object[]{
                    Map.of("to", new Object[]{Map.of("email", to)})
                },
                "subject", subject,
                "content", new Object[]{
                    Map.of("type", "text/plain", "value", body)
                }
            );

            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.sendgrid.com/v3/mail/send",
                new HttpEntity<>(payload, headers),
                String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent via SendGrid to {}: {}", to, subject);
            } else {
                log.warn("SendGrid returned {} for {}", response.getStatusCode(), to);
            }
        } catch (Exception e) {
            log.warn("SendGrid send failed for {}: {}", to, e.getMessage());
        }
    }
}
