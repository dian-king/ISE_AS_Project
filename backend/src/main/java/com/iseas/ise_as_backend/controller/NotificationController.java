package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.Notification;
import com.iseas.ise_as_backend.model.NotificationTemplate;
import com.iseas.ise_as_backend.repository.NotificationRepository;
import com.iseas.ise_as_backend.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;

    // ── Notification history ──────────────────────────────────────────────────

    /** Admin: full delivery log, newest first. */
    @GetMapping
    public ResponseEntity<List<Notification>> listAll() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }

    /** Parent: own notification history. */
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> listMine(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Template management (admin) ───────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<List<NotificationTemplate>> listTemplates() {
        return ResponseEntity.ok(templateRepository.findAll());
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<NotificationTemplate> getTemplate(@PathVariable UUID id) {
        return templateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates")
    public ResponseEntity<NotificationTemplate> createTemplate(
            @RequestBody NotificationTemplate template) {
        return ResponseEntity.ok(templateRepository.save(template));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<NotificationTemplate> updateTemplate(
            @PathVariable UUID id,
            @RequestBody NotificationTemplate updated) {
        return templateRepository.findById(id).map(t -> {
            t.setSubjectTemplate(updated.getSubjectTemplate());
            t.setBodyTemplate(updated.getBodyTemplate());
            t.setEnabled(updated.isEnabled());
            return ResponseEntity.ok(templateRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        if (!templateRepository.existsById(id)) return ResponseEntity.notFound().build();
        templateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
