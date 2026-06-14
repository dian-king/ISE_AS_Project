package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Application application;

    @Column(nullable = false)
    private LocalDateTime interviewDate;

    /** Physical venue address or virtual meeting link. */
    private String location;

    private String notes;

    @Builder.Default
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InterviewMode mode = InterviewMode.PHYSICAL;

    // Evaluation rubric scores (1–10 each)
    private Integer communicationScore;
    private Integer confidenceScore;
    private Integer academicReadinessScore;
    private Integer languageScore;
    private Integer behavioralScore;
    private Integer criticalThinkingScore;

    private String outcome; // PASS, CONDITIONAL_PASS, WAITLIST, FAIL
    private String evaluationNotes;
    private String evaluatedBy;

    private LocalDateTime evaluatedAt;
}
