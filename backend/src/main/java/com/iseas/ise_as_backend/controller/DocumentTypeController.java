package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.DocumentType;
import com.iseas.ise_as_backend.repository.DocumentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

    private final DocumentTypeRepository documentTypeRepository;

    @GetMapping
    public ResponseEntity<List<DocumentType>> getAll() {
        return ResponseEntity.ok(documentTypeRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentType> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document type not found")));
    }

    @PostMapping
    public ResponseEntity<DocumentType> create(@RequestBody DocumentType request) {
        if (documentTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("A document type with this name already exists.");
        }
        return ResponseEntity.ok(documentTypeRepository.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentType> update(@PathVariable UUID id, @RequestBody DocumentType request) {
        DocumentType existing = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document type not found"));
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setRequired(request.isRequired());
        existing.setMaxFileSizeBytes(request.getMaxFileSizeBytes());
        existing.setAllowedMimeTypes(request.getAllowedMimeTypes());
        return ResponseEntity.ok(documentTypeRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        documentTypeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
