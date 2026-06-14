package com.iseas.ise_as_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_actor", columnList = "actor_email"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_school", columnList = "school_id"),
    @Index(name = "idx_audit_timestamp", columnList = "performed_at")
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Who performed the action
    @Column(name = "actor_email", nullable = false, columnDefinition = "varchar(255) default 'system'")
    private String actorEmail;

    @Column(name = "actor_role")
    private String actorRole;

    // School context (nullable for super-admin cross-school actions)
    @Column(name = "school_id")
    private UUID schoolId;

    // What was done
    @Column(nullable = false)
    private String action;

    // Which entity was affected
    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    // Before/after state snapshot (JSON or plain text)
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    // Additional context
    @Column(columnDefinition = "TEXT")
    private String details;

    // Network context
    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "performed_at", nullable = false, updatable = false)
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        performedAt = LocalDateTime.now();
    }
}
