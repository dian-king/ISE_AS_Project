package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    Optional<Interview> findByApplicationId(UUID applicationId);
}
