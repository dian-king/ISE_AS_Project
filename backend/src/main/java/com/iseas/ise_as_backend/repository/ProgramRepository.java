package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProgramRepository extends JpaRepository<Program, UUID> {
    List<Program> findBySchoolIdAndActiveTrue(UUID schoolId);
}
