package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.AdmissionsCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdmissionsCycleRepository extends JpaRepository<AdmissionsCycle, UUID> {
    List<AdmissionsCycle> findBySchoolIdOrderByAcademicYearDesc(UUID schoolId);
    Optional<AdmissionsCycle> findBySchoolIdAndActiveTrue(UUID schoolId);
    Optional<AdmissionsCycle> findBySchoolIdAndAcademicYear(UUID schoolId, String academicYear);
}
