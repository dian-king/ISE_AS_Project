package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "workflow_configs",
       uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "grade"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private School school;

    /** Null means "all grades" / default config for the school. */
    private String grade;

    /** REQUIRED | OPTIONAL | NONE */
    @Builder.Default
    private String interviewRequirement = "OPTIONAL";

    /** How many academic review rounds are expected before a decision. */
    @Builder.Default
    private int reviewRounds = 1;

    /** Minimum number of committee members needed before a decision can be recorded. */
    @Builder.Default
    private int committeeMinMembers = 1;

    /** Whether the Principal must explicitly approve every decision. */
    @Builder.Default
    private boolean principalApprovalRequired = true;
}
