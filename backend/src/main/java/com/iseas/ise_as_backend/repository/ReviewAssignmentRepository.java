package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.ReviewAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewAssignmentRepository extends JpaRepository<ReviewAssignment, UUID> {
    List<ReviewAssignment> findByApplicationId(UUID applicationId);
    List<ReviewAssignment> findByReviewerId(UUID reviewerId);
}
