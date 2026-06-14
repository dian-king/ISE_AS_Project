package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.EnrollmentFormRequest;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import com.iseas.ise_as_backend.service.EmailService;
import com.iseas.ise_as_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Slf4j
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // ── Start enrollment (parent, after accepting offer) ───────────────────

    @PostMapping("/start/{offerId}")
    @Transactional
    public ResponseEntity<Enrollment> startEnrollment(@PathVariable UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getOfferStatus() != OfferStatus.ACCEPTED) {
            throw new RuntimeException("Enrollment can only be started after the offer has been accepted.");
        }

        // Prevent duplicate enrollment records
        if (enrollmentRepository.findByOfferId(offerId).isPresent()) {
            return ResponseEntity.ok(enrollmentRepository.findByOfferId(offerId).get());
        }

        Applicant applicant = offer.getApplication().getApplicant();
        Enrollment enrollment = Enrollment.builder()
                .offer(offer)
                .applicant(applicant)
                .status(EnrollmentStatus.PENDING_FORM)
                .build();

        enrollment = enrollmentRepository.save(enrollment);

        // Advance application status
        Application app = offer.getApplication();
        app.setStatus(ApplicationStatus.ENROLLMENT_PENDING);
        applicationRepository.save(app);

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app)
                .status(ApplicationStatus.ENROLLMENT_PENDING)
                .changedBy(currentUser)
                .notes("Enrollment process started")
                .build());

        try {
            String parentEmail = applicant.getParent().getEmail();
            String parentName = applicant.getParent().getFirstName() + " " + applicant.getParent().getLastName();
            String studentName = applicant.getFirstName() + " " + applicant.getLastName();
            notificationService.send(
                NotificationEventType.ENROLLMENT_STARTED, parentEmail, null,
                Map.of("parentName", parentName, "studentName", studentName)
            );
        } catch (Exception e) {
            log.warn("Failed to fire ENROLLMENT_STARTED notification: {}", e.getMessage());
        }

        return ResponseEntity.ok(enrollment);
    }

    // ── Get enrollment ─────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found")));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Enrollment>> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(enrollmentRepository.findByApplicantParentEmail(email));
    }

    @GetMapping("/offer/{offerId}")
    public ResponseEntity<Enrollment> getByOffer(@PathVariable UUID offerId) {
        return ResponseEntity.ok(enrollmentRepository.findByOfferId(offerId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found for this offer")));
    }

    // ── Admin: list all enrollments for the school ─────────────────────────

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listAll() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User caller = userRepository.findByEmail(email).orElseThrow();

        List<Enrollment> enrollments = (caller.getSchool() != null)
                ? enrollmentRepository.findByOfferApplicationSchoolId(caller.getSchool().getId())
                : enrollmentRepository.findAll();

        List<Map<String, Object>> result = enrollments.stream().map(e -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", e.getId());
            row.put("status", e.getStatus().name());
            row.put("enrollmentDate", e.getEnrollmentDate() != null ? e.getEnrollmentDate().toString() : null);
            Applicant a = e.getApplicant();
            if (a != null) {
                row.put("studentName", a.getFirstName() + " " + a.getLastName());
                // include student number if a student record exists
                studentRepository.findByApplicantId(a.getId()).ifPresent(s -> {
                    row.put("studentNumber", s.getStudentNumber());
                });
            }
            if (e.getOffer() != null && e.getOffer().getApplication() != null) {
                row.put("grade", e.getOffer().getApplication().getGradeApplyingFor());
            }
            return row;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ── Submit enrollment form (parent) ────────────────────────────────────

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Enrollment> submitForm(
            @PathVariable UUID id,
            @RequestBody EnrollmentFormRequest request) {

        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() == EnrollmentStatus.ENROLLED) {
            throw new RuntimeException("This enrollment is already finalised and cannot be modified.");
        }

        enrollment.setEmergencyContactName(request.getEmergencyContactName());
        enrollment.setEmergencyContactPhone(request.getEmergencyContactPhone());
        enrollment.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        enrollment.setMedicalNotes(request.getMedicalNotes());
        enrollment.setTransportRequired(request.isTransportRequired());
        enrollment.setUniformSize(request.getUniformSize());
        enrollment.setPreferredLanguage(request.getPreferredLanguage());
        enrollment.setAdditionalNotes(request.getAdditionalNotes());
        enrollment.setStatus(EnrollmentStatus.FORM_SUBMITTED);

        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    // ── Registrar: mark under review ───────────────────────────────────────

    @PostMapping("/{id}/review")
    @Transactional
    public ResponseEntity<Enrollment> markUnderReview(@PathVariable UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() != EnrollmentStatus.FORM_SUBMITTED) {
            throw new RuntimeException("Enrollment form must be submitted before it can be reviewed.");
        }

        enrollment.setStatus(EnrollmentStatus.UNDER_REVIEW);
        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    // ── Registrar: complete enrollment → create student record ────────────

    @PostMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<Student> completeEnrollment(@PathVariable UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() == EnrollmentStatus.ENROLLED) {
            throw new RuntimeException("This enrollment has already been completed.");
        }

        // Check role: only REGISTRAR or SUPER_ADMIN may complete enrollment
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User caller = userRepository.findByEmail(currentEmail).orElseThrow();
        if (caller.getRole() != Role.REGISTRAR && caller.getRole() != Role.SUPER_ADMIN
                && caller.getRole() != Role.SCHOOL_ADMINISTRATOR) {
            throw new RuntimeException("Only a Registrar may complete the enrollment process.");
        }

        // Guard against duplicate student record
        if (studentRepository.existsByApplicantId(enrollment.getApplicant().getId())) {
            throw new RuntimeException("A student record already exists for this applicant.");
        }

        enrollment.setStatus(EnrollmentStatus.ENROLLED);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollmentRepository.save(enrollment);

        // Generate student number: STU-YYYY-NNNNN
        String year = String.valueOf(LocalDateTime.now().getYear());
        String seq = String.format("%05d", studentRepository.count() + 1);
        String studentNumber = "STU-" + year + "-" + seq;

        Student student = Student.builder()
                .studentNumber(studentNumber)
                .applicant(enrollment.getApplicant())
                .enrollment(enrollment)
                .build();
        student = studentRepository.save(student);

        // Update application to ENROLLED
        Application app = enrollment.getOffer().getApplication();
        app.setStatus(ApplicationStatus.ENROLLED);
        applicationRepository.save(app);

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app)
                .status(ApplicationStatus.ENROLLED)
                .changedBy(currentEmail)
                .notes("Enrollment completed. Student number: " + studentNumber)
                .build());

        // Send confirmation email + notification
        try {
            String parentEmail = enrollment.getApplicant().getParent().getEmail();
            String parentName = enrollment.getApplicant().getParent().getFirstName() + " "
                    + enrollment.getApplicant().getParent().getLastName();
            String studentName = enrollment.getApplicant().getFirstName() + " "
                    + enrollment.getApplicant().getLastName();
            String grade = app.getGradeApplyingFor();
            String academicYear = app.getAcademicYear();
            emailService.sendEnrollmentConfirmationEmail(
                    parentEmail, enrollment.getApplicant().getParent().getFirstName(),
                    studentName, studentNumber, grade, academicYear);
            notificationService.send(
                NotificationEventType.ENROLLMENT_CONFIRMED, parentEmail, null,
                Map.of("parentName", parentName, "studentName", studentName,
                       "studentNumber", studentNumber, "grade", grade, "academicYear", academicYear)
            );
        } catch (Exception e) {
            log.warn("Failed to fire ENROLLMENT_CONFIRMED notification: {}", e.getMessage());
        }

        return ResponseEntity.ok(student);
    }

    // ── Student lookup endpoints ───────────────────────────────────────────

    @GetMapping("/students/{studentNumber}")
    public ResponseEntity<Student> getStudentByNumber(@PathVariable String studentNumber) {
        return ResponseEntity.ok(studentRepository.findByStudentNumber(studentNumber)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }

    @GetMapping("/students/applicant/{applicantId}")
    public ResponseEntity<Student> getStudentByApplicant(@PathVariable UUID applicantId) {
        return ResponseEntity.ok(studentRepository.findByApplicantId(applicantId)
                .orElseThrow(() -> new RuntimeException("No student record found for this applicant")));
    }
}
