package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "grade_deadlines",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cycle_id", "grade"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeDeadline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AdmissionsCycle cycle;

    @Column(nullable = false)
    private String grade;

    private LocalDate deadline;

    @Builder.Default
    private Integer capacity = 0;
}
