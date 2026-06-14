package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByApplicationId(UUID applicationId);
    List<Review> findByReviewerId(UUID reviewerId);
    boolean existsByApplicationIdAndReviewerId(UUID applicationId, UUID reviewerId);
}
