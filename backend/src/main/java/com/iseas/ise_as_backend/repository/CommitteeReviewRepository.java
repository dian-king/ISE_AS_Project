package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.CommitteeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommitteeReviewRepository extends JpaRepository<CommitteeReview, UUID> {
    List<CommitteeReview> findByApplicationId(UUID applicationId);
    boolean existsByApplicationIdAndReviewerEmail(UUID applicationId, String reviewerEmail);
}
