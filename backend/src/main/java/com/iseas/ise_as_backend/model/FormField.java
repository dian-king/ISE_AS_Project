package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "form_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private FormSection section;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String helpText;

    /** TEXT | NUMBER | DATE | SELECT | CHECKBOX | TEXTAREA | FILE */
    @Builder.Default
    private String fieldType = "TEXT";

    @Builder.Default
    private boolean required = false;

    /** Comma-separated option values for SELECT fields. */
    @Column(columnDefinition = "TEXT")
    private String options;

    @Builder.Default
    private int displayOrder = 0;

    @Builder.Default
    private boolean enabled = true;
}
