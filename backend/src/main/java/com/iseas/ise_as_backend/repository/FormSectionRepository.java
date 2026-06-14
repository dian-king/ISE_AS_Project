package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.FormSection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FormSectionRepository extends JpaRepository<FormSection, UUID> {
    List<FormSection> findBySchoolIdOrderByDisplayOrderAsc(UUID schoolId);
    List<FormSection> findBySchoolIdAndEnabledTrueOrderByDisplayOrderAsc(UUID schoolId);
}
