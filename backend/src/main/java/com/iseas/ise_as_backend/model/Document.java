package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String contentType;

    /** Plain-string type kept for backward compatibility (e.g. "BIRTH_CERTIFICATE"). */
    private String documentType;

    /** FK to the configurable document_types catalogue. Nullable so old records are unaffected. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DocumentType documentTypeRef;

    /** File size in bytes captured at upload time. */
    private Long fileSize;

    /** SHA-256 hex digest of the file contents for integrity verification. */
    private String checksum;

    /** Email of the user who uploaded this document. */
    private String uploadedBy;

    /** Starts at 1; increments each time the document is resubmitted. */
    @Builder.Default
    private int versionNumber = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DocumentVerificationStatus verificationStatus = DocumentVerificationStatus.PENDING_VERIFICATION;

    private String verifiedBy;
    private String rejectionReason;
    private LocalDateTime verifiedAt;
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
