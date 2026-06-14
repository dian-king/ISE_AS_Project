package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.WorkflowConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowConfigRepository extends JpaRepository<WorkflowConfig, UUID> {
    List<WorkflowConfig> findBySchoolId(UUID schoolId);
    Optional<WorkflowConfig> findBySchoolIdAndGrade(UUID schoolId, String grade);
    /** Returns the school-level default (grade is null). */
    Optional<WorkflowConfig> findBySchoolIdAndGradeIsNull(UUID schoolId);
}
