package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.GradeDeadline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GradeDeadlineRepository extends JpaRepository<GradeDeadline, UUID> {
    List<GradeDeadline> findByCycleId(UUID cycleId);
    Optional<GradeDeadline> findByCycleIdAndGrade(UUID cycleId, String grade);
    void deleteByCycleId(UUID cycleId);
}
