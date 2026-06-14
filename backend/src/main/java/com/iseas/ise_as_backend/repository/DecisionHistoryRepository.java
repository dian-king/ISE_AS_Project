package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.DecisionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DecisionHistoryRepository extends JpaRepository<DecisionHistory, UUID> {
    List<DecisionHistory> findByApplicationIdOrderByPerformedAtAsc(UUID applicationId);
}
