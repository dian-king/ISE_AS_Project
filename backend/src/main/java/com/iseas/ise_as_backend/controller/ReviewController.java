package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.ReviewAssignmentRequest;
import com.iseas.ise_as_backend.dto.ReviewSubmitRequest;
import com.iseas.ise_as_backend.dto.ReviewerResponse;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import com.iseas.ise_as_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewAssignmentRepository reviewAssignmentRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewCategoryRepository reviewCategoryRepository;
    private final ReviewScoreRepository reviewScoreRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── Reviewer Assignment ────────────────────────────────────────────────

    @PostMapping("/review-assignments")
    @PreAuthorize("hasAuthority('REVIEWER_ASSIGN')")
    public ResponseEntity<ReviewAssignment> assignReviewer(@RequestBody ReviewAssignmentRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));
        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        ReviewAssignment assignment = ReviewAssignment.builder()
                .application(application)
                .reviewer(reviewer)
                .assignedBy(currentUser)
                .build();

        if (application.getStatus() == ApplicationStatus.READY_FOR_REVIEW ||
            application.getStatus() == ApplicationStatus.SUBMITTED) {
            application.setStatus(ApplicationStatus.ACADEMIC_REVIEW);
            applicationRepository.save(application);
        }

        ReviewAssignment saved = reviewAssignmentRepository.save(assignment);

        try {
            String studentName = application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName();
            String appRef = application.getApplicationNumber() != null ? application.getApplicationNumber() : application.getId().toString();
            String reviewerName = reviewer.getFirstName() + " " + reviewer.getLastName();
            notificationService.sendEmail(
                NotificationEventType.REVIEW_ASSIGNED, reviewer.getEmail(),
                Map.of("reviewerName", reviewerName, "studentName", studentName, "applicationRef", appRef)
            );
        } catch (Exception e) {
            log.warn("Failed to fire REVIEW_ASSIGNED notification: {}", e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/review-assignments")
    public ResponseEntity<List<ReviewAssignment>> getAssignments(@RequestParam(required = false) UUID applicationId) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();

        if (applicationId != null) {
            return ResponseEntity.ok(reviewAssignmentRepository.findByApplicationId(applicationId));
        }

        // Reviewers only see their own assignments
        if (currentUser.getRole() == Role.REVIEWER) {
            return ResponseEntity.ok(reviewAssignmentRepository.findByReviewerId(currentUser.getId()));
        }
        return ResponseEntity.ok(reviewAssignmentRepository.findAll());
    }

    // ── Review Submission ──────────────────────────────────────────────────

    @PostMapping("/reviews")
    @PreAuthorize("hasAuthority('REVIEW_CREATE')")
    public ResponseEntity<Review> submitReview(@RequestBody ReviewSubmitRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User reviewer = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Reviewer access guard: must be assigned to this application
        if (reviewer.getRole() == Role.REVIEWER) {
            boolean assigned = reviewAssignmentRepository
                    .findByApplicationId(application.getId())
                    .stream()
                    .anyMatch(a -> a.getReviewer().getId().equals(reviewer.getId()));
            if (!assigned) {
                throw new RuntimeException("You are not assigned to review this application.");
            }
        }

        // BR-018: prevent duplicate review submission
        if (reviewRepository.existsByApplicationIdAndReviewerId(application.getId(), reviewer.getId())) {
            throw new RuntimeException("You have already submitted a review for this application. Reviews cannot be modified after submission (BR-018).");
        }

        int overall = calculateOverallScore(request);

        Review review = Review.builder()
                .application(application)
                .reviewer(reviewer)
                .academicScore(request.getAcademicScore())
                .languageScore(request.getLanguageScore())
                .behaviorScore(request.getBehaviorScore())
                .extracurricularScore(request.getExtracurricularScore())
                .overallScore(overall)
                .recommendation(request.getRecommendation())
                .comments(request.getComments())
                .submitted(true)
                .build();

        Review saved = reviewRepository.save(review);

        // Save per-category rubric scores if provided
        if (request.getScores() != null && !request.getScores().isEmpty()) {
            List<ReviewScore> scores = request.getScores().stream().map(s -> {
                ReviewCategory category = reviewCategoryRepository.findById(s.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Review category not found: " + s.getCategoryId()));
                return ReviewScore.builder()
                        .review(saved)
                        .category(category)
                        .score(s.getScore())
                        .comment(s.getComment())
                        .build();
            }).collect(Collectors.toList());
            reviewScoreRepository.saveAll(scores);
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(@RequestParam(required = false) UUID applicationId) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();

        if (applicationId != null) {
            // Reviewer access guard: only see reviews for assigned applications
            if (currentUser.getRole() == Role.REVIEWER) {
                boolean assigned = reviewAssignmentRepository
                        .findByApplicationId(applicationId)
                        .stream()
                        .anyMatch(a -> a.getReviewer().getId().equals(currentUser.getId()));
                if (!assigned) {
                    throw new RuntimeException("You are not assigned to this application.");
                }
            }
            return ResponseEntity.ok(reviewRepository.findByApplicationId(applicationId));
        }

        // Without applicationId: reviewers only see their own reviews
        if (currentUser.getRole() == Role.REVIEWER) {
            return ResponseEntity.ok(reviewRepository.findByReviewerId(currentUser.getId()));
        }
        return ResponseEntity.ok(reviewRepository.findAll());
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<Review> getReview(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found")));
    }

    @GetMapping("/reviews/{id}/scores")
    public ResponseEntity<List<ReviewScore>> getReviewScores(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewScoreRepository.findByReviewId(id));
    }

    // ── Reviewer Directory ─────────────────────────────────────────────────

    @GetMapping("/staff/reviewers")
    public ResponseEntity<List<ReviewerResponse>> getAvailableReviewers() {
        List<User> reviewers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.REVIEWER || u.getRole() == Role.PRINCIPAL ||
                             u.getRole() == Role.ADMISSIONS_OFFICER)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviewers.stream()
                .map(u -> ReviewerResponse.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList()));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private int calculateOverallScore(ReviewSubmitRequest request) {
        int count = 0;
        int sum = 0;
        if (request.getAcademicScore() != null) { sum += request.getAcademicScore(); count++; }
        if (request.getLanguageScore() != null) { sum += request.getLanguageScore(); count++; }
        if (request.getBehaviorScore() != null) { sum += request.getBehaviorScore(); count++; }
        if (request.getExtracurricularScore() != null) { sum += request.getExtracurricularScore(); count++; }
        return count > 0 ? sum / count : 0;
    }
}
