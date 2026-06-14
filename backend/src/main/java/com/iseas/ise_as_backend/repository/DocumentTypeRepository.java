package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface DocumentTypeRepository extends JpaRepository<DocumentType, UUID> {
    Optional<DocumentType> findByName(String name);
    boolean existsByName(String name);
}
