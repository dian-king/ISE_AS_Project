package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.AuditLog;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.AuditLogRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USER_MANAGE')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/audit?page=0&size=50
     * Full audit log for the caller's school, newest first.
     */
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        return ResponseEntity.ok(auditLogRepository.findBySchoolIdOrderByPerformedAtDesc(schoolId, pageable));
    }

    /**
     * GET /api/v1/audit/search?action=CREATE&entityType=Application&from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
     */
    @GetMapping("/search")
    public ResponseEntity<Page<AuditLog>> search(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        return ResponseEntity.ok(
                auditLogRepository.search(schoolId, action, entityType, from, to, pageable));
    }

    /**
     * GET /api/v1/audit/entity/{type}/{id}
     * Full history for a specific entity (e.g., entityType=Application, entityId={uuid}).
     */
    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<List<AuditLog>> getEntityHistory(
            @PathVariable String type,
            @PathVariable String id) {
        return ResponseEntity.ok(
                auditLogRepository.findByEntityTypeAndEntityIdOrderByPerformedAtAsc(type, id));
    }

    /**
     * GET /api/v1/audit/user/{email}?page=0&size=50
     * All audit events initiated by a specific user in this school.
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<Page<AuditLog>> getUserAudit(
            @PathVariable String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        return ResponseEntity.ok(
                auditLogRepository.findBySchoolIdAndActorEmailOrderByPerformedAtDesc(
                        schoolId, email, pageable));
    }

    /**
     * GET /api/v1/audit/{id}
     * Single audit log entry.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getEntry(@PathVariable UUID id) {
        return auditLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private UUID resolveSchoolId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSchool() == null) throw new RuntimeException("User has no school assigned");
        return user.getSchool().getId();
    }
}
