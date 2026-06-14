package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.AdmissionsDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AdmissionsDecisionRepository extends JpaRepository<AdmissionsDecision, UUID> {
    Optional<AdmissionsDecision> findByApplicationId(UUID applicationId);
}
