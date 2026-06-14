package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.FormField;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FormFieldRepository extends JpaRepository<FormField, UUID> {
    List<FormField> findBySectionIdOrderByDisplayOrderAsc(UUID sectionId);
    List<FormField> findBySectionIdAndEnabledTrueOrderByDisplayOrderAsc(UUID sectionId);
    void deleteBySectionId(UUID sectionId);
}
