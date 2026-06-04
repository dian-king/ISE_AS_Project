package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.Application;
import com.iseas.ise_as_backend.model.Document;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
import com.iseas.ise_as_backend.repository.DocumentRepository;
import com.iseas.ise_as_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("applicationId") UUID applicationId,
            @RequestParam("documentType") String documentType
    ) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String filename = fileStorageService.store(file);

        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .filePath(filename)
                .contentType(file.getContentType())
                .documentType(documentType)
                .application(application)
                .build();

        return ResponseEntity.ok(documentRepository.save(document));
    }
}
