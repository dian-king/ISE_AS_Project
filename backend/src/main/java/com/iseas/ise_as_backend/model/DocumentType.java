package com.iseas.ise_as_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Builder.Default
    private boolean required = false;

    /** Null means no enforced limit. */
    private Long maxFileSizeBytes;

    /** Comma-separated MIME types, e.g. "application/pdf,image/jpeg,image/png" */
    private String allowedMimeTypes;
}
