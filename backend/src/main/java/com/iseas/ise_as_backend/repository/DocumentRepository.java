package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByApplicationId(UUID applicationId);
}
