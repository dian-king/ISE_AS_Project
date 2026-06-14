package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Allows schools to override the default English labels used in the platform.
 * Example: key="application" value="Ubusabe" for Kinyarwanda; key="grade" value="Icyiciro".
 */
@Entity
@Table(name = "school_terminology",
       uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "term_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolTerminology {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private School school;

    @Column(name = "term_key", nullable = false)
    private String key;

    @Column(nullable = false)
    private String value;

    /** Language code for this override, e.g. "rw" (Kinyarwanda), "fr", "en". */
    @Builder.Default
    private String language = "en";
}
