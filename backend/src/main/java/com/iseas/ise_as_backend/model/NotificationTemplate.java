package com.iseas.ise_as_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "notification_templates",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_type", "channel"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private NotificationEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    /** Used for EMAIL channel. Supports {{placeholder}} syntax. */
    private String subjectTemplate;

    /** Body text. Supports {{placeholder}} syntax. */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String bodyTemplate;

    @Builder.Default
    private boolean enabled = true;
}
