package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.CommitteeReviewRequest;
import com.iseas.ise_as_backend.dto.DecisionRequest;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import com.iseas.ise_as_backend.service.AuditService;
import com.iseas.ise_as_backend.service.EmailService;
import com.iseas.ise_as_backend.service.LetterGeneratorService;
import com.iseas.ise_as_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class DecisionController {

    private final AdmissionsDecisionRepository decisionRepository;
    private final CommitteeReviewRepository committeeReviewRepository;
    private final DecisionHistoryRepository decisionHistoryRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final LetterGeneratorService letterGenerator;
    private final NotificationService notificationService;
    private final AuditService auditService;

    // ── Committee Input ────────────────────────────────────────────────────

    @PostMapping("/committee-reviews")
    public ResponseEntity<CommitteeReview> submitCommitteeInput(@RequestBody CommitteeReviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // One input per member per application
        if (committeeReviewRepository.existsByApplicationIdAndReviewerEmail(application.getId(), currentUser)) {
            throw new RuntimeException("You have already submitted your committee input for this application.");
        }

        CommitteeReview review = CommitteeReview.builder()
                .application(application)
                .reviewerEmail(currentUser)
                .recommendation(request.getRecommendation())
                .notes(request.getNotes())
                .build();

        decisionHistoryRepository.save(DecisionHistory.builder()
                .application(application)
                .decision(request.getRecommendation())
                .action("COMMITTEE_INPUT")
                .performedBy(currentUser)
                .notes(request.getNotes())
                .build());

        return ResponseEntity.ok(committeeReviewRepository.save(review));
    }

    @GetMapping("/committee-reviews/{applicationId}")
    public ResponseEntity<List<CommitteeReview>> getCommitteeReviews(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(committeeReviewRepository.findByApplicationId(applicationId));
    }

    // ── Formal Decision ────────────────────────────────────────────────────

    @PostMapping("/decisions")
    @PreAuthorize("hasAuthority('DECISION_APPROVE')")
    public ResponseEntity<AdmissionsDecision> recordDecision(@RequestBody DecisionRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // BR-020: only PRINCIPAL or ADMISSIONS_COMMITTEE may record the formal decision
        User caller = userRepository.findByEmail(currentUser).orElseThrow();
        if (caller.getRole() != Role.PRINCIPAL && caller.getRole() != Role.ADMISSIONS_COMMITTEE
                && caller.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException(
                "BR-020: Only a Principal or Admissions Committee member may record a formal decision.");
        }

        // BR-021: once a decision exists for this application it is immutable
        if (decisionRepository.findByApplicationId(application.getId()).isPresent()) {
            throw new RuntimeException(
                "BR-021: A formal decision already exists for this application and cannot be modified.");
        }

        // Generate formal letter
        String letter = letterGenerator.generate(application, request.getDecision(), request.getDecisionReason());

        AdmissionsDecision decision = AdmissionsDecision.builder()
                .application(application)
                .decision(request.getDecision())
                .decisionReason(request.getDecisionReason())
                .approvedBy(currentUser)
                .letterContent(letter)
                .build();

        decision = decisionRepository.save(decision);

        // Update application status
        ApplicationStatus newStatus = switch (request.getDecision()) {
            case ACCEPTED   -> ApplicationStatus.ACCEPTED;
            case WAITLISTED -> ApplicationStatus.WAITLISTED;
            case REJECTED   -> ApplicationStatus.REJECTED;
        };
        application.setStatus(newStatus);
        applicationRepository.save(application);

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(newStatus)
                .changedBy(currentUser)
                .notes("Formal decision: " + request.getDecision() + ". " + request.getDecisionReason())
                .build());

        decisionHistoryRepository.save(DecisionHistory.builder()
                .application(application)
                .decision(request.getDecision())
                .action("CREATED")
                .performedBy(currentUser)
                .notes(request.getDecisionReason())
                .build());

        // Auto-generate offer for accepted applicants
        if (request.getDecision() == DecisionType.ACCEPTED) {
            String offerNum = "OFF-" + LocalDateTime.now().getYear()
                    + "-" + String.format("%06d", offerRepository.count() + 1);
            Offer offer = Offer.builder()
                    .application(application)
                    .offerNumber(offerNum)
                    .offerStatus(OfferStatus.PENDING)
                    .build();
            offerRepository.save(offer);
        }

        // Send decision email with letter content and notification
        try {
            String parentEmail = application.getApplicant().getParent().getEmail();
            String parentName = application.getApplicant().getParent().getFirstName() + " "
                    + application.getApplicant().getParent().getLastName();
            String studentName = application.getApplicant().getFirstName() + " "
                    + application.getApplicant().getLastName();
            emailService.sendDecisionEmail(parentEmail,
                    application.getApplicant().getParent().getFirstName(),
                    studentName, request.getDecision().name(), letter);

            notificationService.send(
                NotificationEventType.DECISION_RELEASED, parentEmail, null,
                Map.of("parentName", parentName, "studentName", studentName,
                       "decision", request.getDecision().name(), "letterContent", letter != null ? letter : "")
            );

            if (request.getDecision() == DecisionType.ACCEPTED) {
                notificationService.send(
                    NotificationEventType.OFFER_ISSUED, parentEmail, null,
                    Map.of("parentName", parentName, "studentName", studentName,
                           "offerExpiry", "Mutaha wa 14 (iminsi 14 / 14 days)")
                );
            }
        } catch (Exception e) {
            log.warn("Failed to fire decision notifications: {}", e.getMessage());
        }

        auditService.record("DECISION_RECORDED", "Application", application.getId().toString(),
                null, request.getDecision().name(),
                "Decision: " + request.getDecision() + " by " + currentUser + ". Reason: " + request.getDecisionReason());

        return ResponseEntity.ok(decision);
    }

    @GetMapping("/decisions/{applicationId}")
    public ResponseEntity<AdmissionsDecision> getDecision(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(decisionRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("Decision not found")));
    }

    @GetMapping("/decisions/{applicationId}/letter")
    public ResponseEntity<Map<String, String>> getLetter(@PathVariable UUID applicationId) {
        AdmissionsDecision decision = decisionRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("No decision found for this application"));
        return ResponseEntity.ok(Map.of(
                "decision", decision.getDecision().name(),
                "letterContent", decision.getLetterContent() != null ? decision.getLetterContent() : ""
        ));
    }

    @GetMapping("/decisions/{applicationId}/history")
    public ResponseEntity<List<DecisionHistory>> getHistory(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(
                decisionHistoryRepository.findByApplicationIdOrderByPerformedAtAsc(applicationId));
    }

    // ── Offers ─────────────────────────────────────────────────────────────

    @GetMapping("/offers/{applicationId}")
    public ResponseEntity<Offer> getOffer(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(offerRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("Offer not found")));
    }

    @PostMapping("/offers/{id}/accept")
    public ResponseEntity<Offer> acceptOffer(@PathVariable UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getExpiryDate() != null && LocalDateTime.now().isAfter(offer.getExpiryDate())) {
            throw new RuntimeException("This offer has expired and can no longer be accepted.");
        }
        if (offer.getOfferStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("This offer has already been responded to.");
        }

        offer.setOfferStatus(OfferStatus.ACCEPTED);
        offer.setRespondedAt(LocalDateTime.now());
        offerRepository.save(offer);

        Application application = offer.getApplication();
        application.setStatus(ApplicationStatus.OFFER_ACCEPTED);
        applicationRepository.save(application);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.OFFER_ACCEPTED)
                .changedBy(currentUser)
                .notes("Parent accepted the offer")
                .build());

        return ResponseEntity.ok(offer);
    }

    @PostMapping("/offers/{id}/decline")
    public ResponseEntity<Offer> declineOffer(@PathVariable UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getOfferStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("This offer has already been responded to.");
        }

        offer.setOfferStatus(OfferStatus.DECLINED);
        offer.setRespondedAt(LocalDateTime.now());
        offerRepository.save(offer);

        Application application = offer.getApplication();
        application.setStatus(ApplicationStatus.OFFER_DECLINED);
        applicationRepository.save(application);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.OFFER_DECLINED)
                .changedBy(currentUser)
                .notes("Parent declined the offer")
                .build());

        return ResponseEntity.ok(offer);
    }
}
