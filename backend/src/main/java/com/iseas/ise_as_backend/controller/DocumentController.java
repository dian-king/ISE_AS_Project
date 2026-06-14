package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.DocumentVerificationRequest;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
import com.iseas.ise_as_backend.repository.DocumentRepository;
import com.iseas.ise_as_backend.repository.DocumentTypeRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import com.iseas.ise_as_backend.service.FileStorageService;
import com.iseas.ise_as_backend.service.FileStorageService.StorageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("applicationId") UUID applicationId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "documentTypeId", required = false) UUID documentTypeId
    ) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        DocumentType typeRef = null;
        if (documentTypeId != null) {
            typeRef = documentTypeRepository.findById(documentTypeId)
                    .orElseThrow(() -> new RuntimeException("Document type not found"));
            enforceTypeLimits(file, typeRef);
        }

        StorageResult stored = fileStorageService.storeWithMetadata(file);
        String uploader = SecurityContextHolder.getContext().getAuthentication().getName();

        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .filePath(stored.filename())
                .contentType(file.getContentType())
                .documentType(documentType)
                .documentTypeRef(typeRef)
                .fileSize(stored.fileSize())
                .checksum(stored.checksum())
                .uploadedBy(uploader)
                .versionNumber(1)
                .application(application)
                .verificationStatus(DocumentVerificationStatus.PENDING_VERIFICATION)
                .build();

        return ResponseEntity.ok(documentRepository.save(document));
    }

    @GetMapping
    public ResponseEntity<List<Document>> getDocumentsByApplication(@RequestParam UUID applicationId) {
        return ResponseEntity.ok(documentRepository.findByApplicationId(applicationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable UUID id) {
        return ResponseEntity.ok(documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found")));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('DOCUMENT_VERIFY')")
    public ResponseEntity<Document> verifyDocument(
            @PathVariable UUID id,
            @RequestBody DocumentVerificationRequest request
    ) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        document.setVerificationStatus(request.getStatus());
        document.setVerifiedBy(currentUser);
        document.setVerifiedAt(LocalDateTime.now());

        if (request.getStatus() == DocumentVerificationStatus.REJECTED ||
            request.getStatus() == DocumentVerificationStatus.REQUIRES_RESUBMISSION) {
            document.setRejectionReason(request.getRejectionReason());
        }

        return ResponseEntity.ok(documentRepository.save(document));
    }

    @PostMapping("/{id}/resubmit")
    public ResponseEntity<Document> resubmitDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDocumentTypeRef() != null) {
            enforceTypeLimits(file, document.getDocumentTypeRef());
        }

        StorageResult stored = fileStorageService.storeWithMetadata(file);
        String uploader = SecurityContextHolder.getContext().getAuthentication().getName();

        document.setFileName(file.getOriginalFilename());
        document.setFilePath(stored.filename());
        document.setContentType(file.getContentType());
        document.setFileSize(stored.fileSize());
        document.setChecksum(stored.checksum());
        document.setUploadedBy(uploader);
        document.setVersionNumber(document.getVersionNumber() + 1);
        document.setVerificationStatus(DocumentVerificationStatus.PENDING_VERIFICATION);
        document.setVerifiedBy(null);
        document.setRejectionReason(null);
        document.setVerifiedAt(null);
        document.setUploadedAt(LocalDateTime.now());

        return ResponseEntity.ok(documentRepository.save(document));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_DELETE')")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id) {
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void enforceTypeLimits(MultipartFile file, DocumentType type) {
        if (type.getMaxFileSizeBytes() != null && file.getSize() > type.getMaxFileSizeBytes()) {
            long limitMb = type.getMaxFileSizeBytes() / (1024 * 1024);
            throw new RuntimeException("File exceeds the " + limitMb + " MB limit for " + type.getName() + " documents.");
        }
        if (type.getAllowedMimeTypes() != null && !type.getAllowedMimeTypes().isBlank()) {
            List<String> allowed = Arrays.asList(type.getAllowedMimeTypes().split(","));
            if (file.getContentType() == null || !allowed.contains(file.getContentType().trim())) {
                throw new RuntimeException("File type '" + file.getContentType() + "' is not allowed for " + type.getName() + " documents. Allowed: " + type.getAllowedMimeTypes());
            }
        }
    }
}
