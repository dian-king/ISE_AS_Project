package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User reviewer;

    private Integer academicScore;
    private Integer languageScore;
    private Integer behaviorScore;
    private Integer extracurricularScore;
    private Integer overallScore;

    @Enumerated(EnumType.STRING)
    private ReviewRecommendation recommendation;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDateTime submittedAt;

    /** BR-018: once true, this review is immutable. */
    @Builder.Default
    private boolean submitted = false;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
