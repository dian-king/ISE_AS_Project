package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.SchoolTerminology;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public interface SchoolTerminologyRepository extends JpaRepository<SchoolTerminology, UUID> {
    List<SchoolTerminology> findBySchoolId(UUID schoolId);
    List<SchoolTerminology> findBySchoolIdAndLanguage(UUID schoolId, String language);
    Optional<SchoolTerminology> findBySchoolIdAndKey(UUID schoolId, String key);
    void deleteBySchoolIdAndKey(UUID schoolId, String key);
}
