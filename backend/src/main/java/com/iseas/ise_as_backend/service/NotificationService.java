package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.NotificationRepository;
import com.iseas.ise_as_backend.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    /**
     * Fires a notification for the given event. Looks up enabled templates for
     * EMAIL and SMS, fills in {{variable}} placeholders, dispatches, and records
     * the delivery in the notifications table.
     *
     * @param eventType     the lifecycle event
     * @param recipientEmail recipient email address (may be null for SMS-only)
     * @param recipientPhone recipient phone in E.164 format (may be null for email-only)
     * @param variables     map of placeholder keys to replacement values
     */
    public void send(NotificationEventType eventType, String recipientEmail,
                     String recipientPhone, Map<String, String> variables) {
        dispatch(eventType, NotificationChannel.EMAIL, recipientEmail, recipientPhone, variables);
        dispatch(eventType, NotificationChannel.SMS,   recipientEmail, recipientPhone, variables);
    }

    /** Convenience overload for email-only notifications (no phone number available). */
    public void sendEmail(NotificationEventType eventType, String recipientEmail,
                          Map<String, String> variables) {
        dispatch(eventType, NotificationChannel.EMAIL, recipientEmail, null, variables);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void dispatch(NotificationEventType eventType, NotificationChannel channel,
                          String email, String phone, Map<String, String> variables) {

        Optional<NotificationTemplate> templateOpt =
                templateRepository.findByEventTypeAndChannelAndEnabledTrue(eventType, channel);

        if (templateOpt.isEmpty()) {
            log.debug("No enabled {} template found for event {}", channel, eventType);
            return;
        }

        NotificationTemplate template = templateOpt.get();
        String subject = fill(template.getSubjectTemplate(), variables);
        String body    = fill(template.getBodyTemplate(), variables);

        Notification record = Notification.builder()
                .recipientEmail(email)
                .recipientPhone(phone)
                .channel(channel)
                .eventType(eventType)
                .subject(subject)
                .body(body)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            if (channel == NotificationChannel.EMAIL && email != null && !email.isBlank()) {
                emailService.sendRaw(email, subject, body);
                record.setStatus(NotificationStatus.SENT);
                record.setSentAt(LocalDateTime.now());

            } else if (channel == NotificationChannel.SMS && phone != null && !phone.isBlank()) {
                smsService.send(phone, body);
                record.setStatus(NotificationStatus.SENT);
                record.setSentAt(LocalDateTime.now());

            } else {
                // Missing contact info for this channel — skip silently
                return;
            }
        } catch (Exception e) {
            record.setStatus(NotificationStatus.FAILED);
            record.setErrorMessage(e.getMessage());
            log.warn("Notification dispatch failed [{} / {}]: {}", channel, eventType, e.getMessage());
        }

        notificationRepository.save(record);
    }

    /** Replaces every {{key}} in text with the corresponding value from the map. */
    private String fill(String template, Map<String, String> vars) {
        if (template == null) return "";
        String result = template;
        for (Map.Entry<String, String> entry : vars.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }
}
