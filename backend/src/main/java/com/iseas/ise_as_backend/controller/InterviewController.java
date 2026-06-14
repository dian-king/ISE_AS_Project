package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.InterviewEvaluationRequest;
import com.iseas.ise_as_backend.dto.ScheduleInterviewRequest;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import com.iseas.ise_as_backend.service.CalendarService;
import com.iseas.ise_as_backend.service.EmailService;
import com.iseas.ise_as_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {

    private final InterviewRepository interviewRepository;
    private final InterviewAssignmentRepository assignmentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final CalendarService calendarService;

    // ── Schedule ───────────────────────────────────────────────────────────

    @PostMapping("/schedule")
    @Transactional
    @PreAuthorize("hasAuthority('INTERVIEW_CREATE')")
    public ResponseEntity<Interview> scheduleInterview(@RequestBody ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        InterviewMode mode = request.getMode() != null ? request.getMode() : InterviewMode.PHYSICAL;

        Interview interview = Interview.builder()
                .application(application)
                .interviewDate(request.getInterviewDate())
                .location(request.getLocation())
                .notes(request.getNotes())
                .mode(mode)
                .build();

        interview = interviewRepository.save(interview);

        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        String assigner = SecurityContextHolder.getContext().getAuthentication().getName();
        String formattedDate = request.getInterviewDate() != null
                ? request.getInterviewDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                : "TBD";

        // Assign interviewer if provided and send notifications
        if (request.getInterviewerId() != null) {
            User interviewer = userRepository.findById(request.getInterviewerId())
                    .orElseThrow(() -> new RuntimeException("Interviewer not found"));

            InterviewAssignment assignment = InterviewAssignment.builder()
                    .interview(interview)
                    .interviewer(interviewer)
                    .assignedBy(assigner)
                    .build();
            assignmentRepository.save(assignment);

            String studentName = application.getApplicant().getFirstName() + " "
                    + application.getApplicant().getLastName();
            String modeLabel = mode.name();
            String location = request.getLocation() != null ? request.getLocation() : "To be confirmed";

            // Notify interviewer
            emailService.sendInterviewInvitationEmail(
                    interviewer.getEmail(),
                    interviewer.getFirstName(),
                    studentName, formattedDate, modeLabel, location);

            // Notify parent
            String parentEmail = application.getApplicant().getParent().getEmail();
            String parentName = application.getApplicant().getParent().getFirstName();
            emailService.sendInterviewInvitationEmail(
                    parentEmail, parentName, studentName, formattedDate, modeLabel, location);
        }

        // Fire INTERVIEW_SCHEDULED notification to parent
        try {
            String parentEmail = application.getApplicant().getParent().getEmail();
            String parentName = application.getApplicant().getParent().getFirstName() + " "
                    + application.getApplicant().getParent().getLastName();
            String studentName = application.getApplicant().getFirstName() + " "
                    + application.getApplicant().getLastName();
            String location = request.getLocation() != null ? request.getLocation() : "To be confirmed";
            notificationService.send(
                NotificationEventType.INTERVIEW_SCHEDULED, parentEmail, null,
                Map.of("parentName", parentName, "studentName", studentName,
                       "dateTime", formattedDate, "mode", mode.name(), "location", location)
            );
        } catch (Exception e) {
            log.warn("Failed to fire INTERVIEW_SCHEDULED notification: {}", e.getMessage());
        }

        return ResponseEntity.ok(interview);
    }

    // ── Assign Interviewer (post-schedule) ─────────────────────────────────

    @PostMapping("/{id}/assign")
    @Transactional
    public ResponseEntity<InterviewAssignment> assignInterviewer(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        UUID interviewerId = UUID.fromString(body.get("interviewerId"));
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));

        if (assignmentRepository.existsByInterviewIdAndInterviewerId(id, interviewerId)) {
            throw new RuntimeException("This interviewer is already assigned to this interview.");
        }

        String assigner = SecurityContextHolder.getContext().getAuthentication().getName();
        InterviewAssignment assignment = InterviewAssignment.builder()
                .interview(interview)
                .interviewer(interviewer)
                .assignedBy(assigner)
                .build();

        assignment = assignmentRepository.save(assignment);

        // Send invitation email
        Application app = interview.getApplication();
        String studentName = app.getApplicant().getFirstName() + " " + app.getApplicant().getLastName();
        String formattedDate = interview.getInterviewDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
        String location = interview.getLocation() != null ? interview.getLocation() : "To be confirmed";

        emailService.sendInterviewInvitationEmail(
                interviewer.getEmail(), interviewer.getFirstName(),
                studentName, formattedDate, interview.getMode().name(), location);

        return ResponseEntity.ok(assignment);
    }

    // ── List & Get ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Interview>> getAll() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentEmail).orElseThrow();

        // Interviewers only see their assigned interviews
        if (currentUser.getRole() == Role.INTERVIEWER) {
            List<UUID> interviewIds = assignmentRepository
                    .findByInterviewerId(currentUser.getId())
                    .stream()
                    .map(a -> a.getInterview().getId())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(
                    interviewRepository.findAll().stream()
                            .filter(i -> interviewIds.contains(i.getId()))
                            .collect(Collectors.toList()));
        }
        return ResponseEntity.ok(interviewRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found")));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Interview> getByApplication(@PathVariable UUID applicationId) {
        return interviewRepository.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<InterviewAssignment>> getAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(assignmentRepository.findByInterviewId(id));
    }

    // ── Reschedule ─────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Interview> reschedule(
            @PathVariable UUID id,
            @RequestBody ScheduleInterviewRequest request) {

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if ("COMPLETED".equals(interview.getStatus())) {
            throw new RuntimeException("A completed interview cannot be rescheduled.");
        }

        if (request.getInterviewDate() != null) interview.setInterviewDate(request.getInterviewDate());
        if (request.getLocation() != null) interview.setLocation(request.getLocation());
        if (request.getNotes() != null) interview.setNotes(request.getNotes());
        if (request.getMode() != null) interview.setMode(request.getMode());

        return ResponseEntity.ok(interviewRepository.save(interview));
    }

    // ── Evaluate ───────────────────────────────────────────────────────────

    @PostMapping("/{id}/evaluate")
    @Transactional
    @PreAuthorize("hasAuthority('INTERVIEW_EVALUATE')")
    public ResponseEntity<Interview> evaluate(
            @PathVariable UUID id,
            @RequestBody InterviewEvaluationRequest request) {

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        String evaluatorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User evaluator = userRepository.findByEmail(evaluatorEmail).orElseThrow();

        // Interviewer access guard: must be assigned
        if (evaluator.getRole() == Role.INTERVIEWER) {
            boolean assigned = assignmentRepository
                    .findByInterviewId(id)
                    .stream()
                    .anyMatch(a -> a.getInterviewer().getId().equals(evaluator.getId()));
            if (!assigned) {
                throw new RuntimeException("You are not assigned to this interview.");
            }
        }

        interview.setCommunicationScore(request.getCommunicationScore());
        interview.setConfidenceScore(request.getConfidenceScore());
        interview.setAcademicReadinessScore(request.getAcademicReadinessScore());
        interview.setLanguageScore(request.getLanguageScore());
        interview.setBehavioralScore(request.getBehavioralScore());
        interview.setCriticalThinkingScore(request.getCriticalThinkingScore());
        interview.setOutcome(request.getOutcome());
        interview.setEvaluationNotes(request.getEvaluationNotes());
        interview.setEvaluatedBy(evaluatorEmail);
        interview.setEvaluatedAt(LocalDateTime.now());
        interview.setStatus("COMPLETED");

        Application application = interview.getApplication();
        application.setStatus(ApplicationStatus.INTERVIEW_COMPLETED);
        applicationRepository.save(application);

        return ResponseEntity.ok(interviewRepository.save(interview));
    }

    // ── iCalendar download ─────────────────────────────────────────────────

    /**
     * GET /api/v1/interviews/{id}/ical
     * Returns the interview as an iCalendar (.ics) file that can be imported
     * into Google Calendar, Outlook, or Apple Calendar.
     */
    @GetMapping("/{id}/ical")
    public ResponseEntity<byte[]> downloadIcal(@PathVariable UUID id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Application app = interview.getApplication();
        String studentName = app.getApplicant().getFirstName() + " " + app.getApplicant().getLastName();
        String schoolEmail = app.getSchool() != null ? app.getSchool().getContactEmail() : null;
        String location = interview.getLocation() != null ? interview.getLocation() : "To be confirmed";

        String description = "Iga Afriqa Admissions Interview\n" +
                "Student: " + studentName + "\n" +
                "Mode: " + (interview.getMode() != null ? interview.getMode().name() : "PHYSICAL") + "\n" +
                "Notes: " + (interview.getNotes() != null ? interview.getNotes() : "");

        String ical = calendarService.buildInterviewIcal(
                interview.getId(),
                "Iga Afriqa — Ubutumire bw'ubujyanama / Interview: " + studentName,
                description,
                location,
                interview.getInterviewDate() != null ? interview.getInterviewDate() : LocalDateTime.now().plusDays(1),
                60,
                schoolEmail);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "interview-" + id + ".ics");

        return ResponseEntity.ok()
                .headers(headers)
                .body(ical.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    // ── Cancel ─────────────────────────────────────────────────────────────

    @PostMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<Interview> cancel(@PathVariable UUID id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if ("COMPLETED".equals(interview.getStatus())) {
            throw new RuntimeException("A completed interview cannot be cancelled.");
        }

        interview.setStatus("CANCELLED");
        interview.getApplication().setStatus(ApplicationStatus.INTERVIEW_REQUIRED);
        applicationRepository.save(interview.getApplication());

        return ResponseEntity.ok(interviewRepository.save(interview));
    }
}
