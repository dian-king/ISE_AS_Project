package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.ReviewScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewScoreRepository extends JpaRepository<ReviewScore, UUID> {
    List<ReviewScore> findByReviewId(UUID reviewId);
}
