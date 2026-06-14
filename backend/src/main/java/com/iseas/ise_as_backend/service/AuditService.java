package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.model.AuditLog;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.AuditLogRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Records an audit event asynchronously so it never blocks the calling request.
     */
    @Async
    public void record(String action, String entityType, String entityId,
                       String oldValue, String newValue, String details) {
        try {
            String actorEmail = resolveActorEmail();
            String actorRole  = resolveActorRole(actorEmail);
            UUID   schoolId   = resolveSchoolId(actorEmail);

            AuditLog log = AuditLog.builder()
                    .actorEmail(actorEmail)
                    .actorRole(actorRole)
                    .schoolId(schoolId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .details(details)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            log.warn("Audit record failed for action={}: {}", action, e.getMessage());
        }
    }

    /**
     * Overload that also captures IP and User-Agent from the HTTP request.
     */
    @Async
    public void record(String action, String entityType, String entityId,
                       String oldValue, String newValue, String details,
                       HttpServletRequest request) {
        try {
            String actorEmail = resolveActorEmail();
            String actorRole  = resolveActorRole(actorEmail);
            UUID   schoolId   = resolveSchoolId(actorEmail);
            String ip         = extractIp(request);
            String ua         = request.getHeader("User-Agent");

            AuditLog entry = AuditLog.builder()
                    .actorEmail(actorEmail)
                    .actorRole(actorRole)
                    .schoolId(schoolId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .details(details)
                    .ipAddress(ip)
                    .userAgent(ua)
                    .build();

            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit record failed for action={}: {}", action, e.getMessage());
        }
    }

    // ── Shortcuts for common actions ──────────────────────────────────────

    public void recordCreate(String entityType, String entityId, String details) {
        record("CREATE", entityType, entityId, null, null, details);
    }

    public void recordUpdate(String entityType, String entityId, String oldValue, String newValue) {
        record("UPDATE", entityType, entityId, oldValue, newValue, null);
    }

    public void recordDelete(String entityType, String entityId, String details) {
        record("DELETE", entityType, entityId, null, null, details);
    }

    public void recordLogin(String email, String ipAddress) {
        try {
            UUID schoolId = resolveSchoolId(email);
            AuditLog entry = AuditLog.builder()
                    .actorEmail(email)
                    .actorRole(resolveActorRole(email))
                    .schoolId(schoolId)
                    .action("LOGIN")
                    .entityType("User")
                    .entityId(email)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit LOGIN record failed: {}", e.getMessage());
        }
    }

    public void recordLoginFailed(String email, String ipAddress) {
        try {
            AuditLog entry = AuditLog.builder()
                    .actorEmail(email)
                    .action("LOGIN_FAILED")
                    .entityType("User")
                    .entityId(email)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit LOGIN_FAILED record failed: {}", e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private String resolveActorEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }

    private String resolveActorRole(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getRole().name())
                .orElse(null);
    }

    private UUID resolveSchoolId(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getSchool() != null ? u.getSchool().getId() : null)
                .orElse(null);
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
