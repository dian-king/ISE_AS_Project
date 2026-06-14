package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.ReviewRecommendation;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ReviewSubmitRequest {
    private UUID applicationId;

    /** Legacy flat scores — still accepted for backward compatibility. */
    private Integer academicScore;
    private Integer languageScore;
    private Integer behaviorScore;
    private Integer extracurricularScore;

    /** Per-category rubric scores (preferred path when review_categories are configured). */
    private List<CategoryScore> scores;

    private ReviewRecommendation recommendation;
    private String comments;

    @Data
    public static class CategoryScore {
        private UUID categoryId;
        private Integer score;
        private String comment;
    }
}
