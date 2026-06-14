package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admissions_decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionsDecision {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Application application;

    @Enumerated(EnumType.STRING)
    private DecisionType decision;

    @Column(columnDefinition = "TEXT")
    private String decisionReason;

    private String approvedBy;
    private LocalDateTime decisionDate;

    /** Generated formal letter content (acceptance / waitlist / rejection). */
    @Column(columnDefinition = "TEXT")
    private String letterContent;

    @PrePersist
    protected void onCreate() {
        decisionDate = LocalDateTime.now();
    }
}
