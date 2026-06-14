package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.dto.ApplicationSubmissionRequest;
import com.iseas.ise_as_backend.dto.ApplicationTimelineResponse;
import com.iseas.ise_as_backend.dto.ApplicationUpdateRequest;
import com.iseas.ise_as_backend.dto.DashboardStats;
import com.iseas.ise_as_backend.dto.DetailedApplicationResponse;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.ApplicantRepository;
import java.util.Map;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
import com.iseas.ise_as_backend.repository.ApplicationStatusHistoryRepository;
import com.iseas.ise_as_backend.repository.ProgramRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final ProgramRepository programRepository;
    private final UserRepository userRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private static final List<ApplicationStatus> TERMINAL_STATUSES =
            List.of(ApplicationStatus.REJECTED, ApplicationStatus.OFFER_DECLINED);

    @Transactional
    public Application submitApplication(ApplicationSubmissionRequest request) {
        // 1. Get the current logged-in user (parent)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User parent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find the program
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found"));

        // BR-004: one active application per parent per academic year
        String academicYear = "2026-2027";
        if (applicationRepository.existsActiveApplicationForParent(email, academicYear, TERMINAL_STATUSES)) {
            throw new RuntimeException("You already have an active application for the " + academicYear + " academic year.");
        }

        // 3. Create/Update Applicant
        Applicant applicant = Applicant.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(LocalDate.parse(request.getDob()))
                .gender(request.getGender())
                .nationality(request.getNationality())
                .currentSchool(request.getPreviousSchool())
                .languageProficiency(request.getLanguageProficiency())
                .parent(parent)
                // Rwandan Specific Fields
                .nationalId(request.getNationalId())
                .nationalExamIndexNumber(request.getNationalExamIndexNumber())
                .combination(request.getCombination())
                .province(request.getProvince())
                .district(request.getDistrict())
                .sector(request.getSector())
                .cell(request.getCell())
                .village(request.getVillage())
                .ubudeheCategory(request.getUbudeheCategory())
                .build();
        applicant = applicantRepository.save(applicant);

        // 4. Create Application as DRAFT
        Application application = Application.builder()
                .applicant(applicant)
                .school(program.getSchool())
                .gradeApplyingFor(program.getName())
                .academicYear("2026-2027")
                .status(ApplicationStatus.DRAFT)
                .build();

        application = applicationRepository.save(application);

        // 5. Record DRAFT status history
        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.DRAFT)
                .changedBy(email)
                .notes("Application created as draft")
                .build());

        return application;
    }

    @Transactional
    public Application submitDraft(UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Application application = applicationRepository.findByIdAndApplicantParentEmail(id, email)
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));

        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT applications can be submitted.");
        }

        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmissionDate(LocalDateTime.now());

        // Generate application reference number
        School school = application.getSchool();
        String schoolCode = school.getName().substring(0, Math.min(3, school.getName().length())).toUpperCase();
        String year = String.valueOf(LocalDateTime.now().getYear());
        String sequence = String.format("%06d", applicationRepository.count());
        application.setApplicationNumber(schoolCode + "-" + year + "-" + sequence);
        application = applicationRepository.save(application);

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.SUBMITTED)
                .changedBy(email)
                .notes("Application submitted by parent")
                .build());

        try {
            String studentName = application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName();
            emailService.sendSubmissionConfirmationEmail(email, studentName, application.getApplicationNumber());
        } catch (Exception e) {
            System.err.println("Failed to send submission confirmation email: " + e.getMessage());
        }

        try {
            User parent = application.getApplicant().getParent();
            String studentName = application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName();
            String parentName = parent.getFirstName() + " " + parent.getLastName();
            notificationService.send(
                NotificationEventType.APPLICATION_SUBMITTED, email, null,
                java.util.Map.of(
                    "parentName", parentName,
                    "studentName", studentName,
                    "applicationRef", application.getApplicationNumber() != null ? application.getApplicationNumber() : "",
                    "academicYear", application.getAcademicYear()
                )
            );
        } catch (Exception e) {
            System.err.println("Failed to fire APPLICATION_SUBMITTED notification: " + e.getMessage());
        }

        return application;
    }

    @Transactional
    public Application updateApplication(UUID id, ApplicationUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Load application and verify ownership
        Application application = applicationRepository.findByIdAndApplicantParentEmail(id, email)
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));

        // BR-014: only DRAFT applications can be edited
        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new RuntimeException("Submitted applications cannot be modified.");
        }

        // Update applicant fields
        Applicant applicant = application.getApplicant();
        if (request.getFirstName() != null) applicant.setFirstName(request.getFirstName());
        if (request.getLastName() != null) applicant.setLastName(request.getLastName());
        if (request.getDob() != null) applicant.setDateOfBirth(LocalDate.parse(request.getDob()));
        if (request.getGender() != null) applicant.setGender(request.getGender());
        if (request.getNationality() != null) applicant.setNationality(request.getNationality());
        if (request.getPreviousSchool() != null) applicant.setCurrentSchool(request.getPreviousSchool());
        if (request.getLanguageProficiency() != null) applicant.setLanguageProficiency(request.getLanguageProficiency());
        if (request.getNationalId() != null) applicant.setNationalId(request.getNationalId());
        if (request.getNationalExamIndexNumber() != null) applicant.setNationalExamIndexNumber(request.getNationalExamIndexNumber());
        if (request.getCombination() != null) applicant.setCombination(request.getCombination());
        if (request.getProvince() != null) applicant.setProvince(request.getProvince());
        if (request.getDistrict() != null) applicant.setDistrict(request.getDistrict());
        if (request.getSector() != null) applicant.setSector(request.getSector());
        if (request.getCell() != null) applicant.setCell(request.getCell());
        if (request.getVillage() != null) applicant.setVillage(request.getVillage());
        if (request.getUbudeheCategory() != null) applicant.setUbudeheCategory(request.getUbudeheCategory());
        applicantRepository.save(applicant);

        // Update grade if program changed
        if (request.getProgramId() != null) {
            Program program = programRepository.findById(request.getProgramId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
            application.setGradeApplyingFor(program.getName());
        }

        return applicationRepository.save(application);
    }

    public List<DetailedApplicationResponse> getAllApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getSchool() == null) {
            return List.of(); // Return empty list if user has no school assigned
        }
        
        // Staff should only see applications for their school
        return applicationRepository.findBySchoolId(user.getSchool().getId())
                .stream()
                .map(this::mapToDetailedResponse)
                .collect(Collectors.toList());
    }

    public DashboardStats getStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getSchool() == null) {
            return DashboardStats.builder().build();
        }
        
        UUID schoolId = user.getSchool().getId();

        List<Application> apps = applicationRepository.findBySchoolId(schoolId);
        
        return DashboardStats.builder()
                .totalApplications(apps.size())
                .pendingApplications(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED || a.getStatus() == ApplicationStatus.UNDER_REVIEW).count())
                .acceptedApplications(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count())
                .rejectedApplications(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count())
                .build();
    }

    @Transactional
    public void updateStatus(UUID id, ApplicationStatus status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        applicationRepository.save(application);

        // Record status history
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .status(status)
                .changedBy(currentUserEmail)
                .build());

        // Send Email Notification
        try {
            String parentEmail = application.getApplicant().getParent().getEmail();
            String studentName = application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName();
            emailService.sendStatusUpdateEmail(parentEmail, studentName, status.toString());
        } catch (Exception e) {
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
    }

    public List<ApplicationTimelineResponse> getTimeline(UUID id) {
        return statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(id)
                .stream()
                .map(h -> ApplicationTimelineResponse.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .changedBy(h.getChangedBy())
                        .notes(h.getNotes())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public DetailedApplicationResponse getApplicationById(UUID id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // Basic security check: user must belong to the same school
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (!app.getSchool().getId().equals(user.getSchool().getId())) {
            throw new RuntimeException("Unauthorized access to application");
        }
        
        return mapToDetailedResponse(app);
    }

    private DetailedApplicationResponse mapToDetailedResponse(Application app) {
        Applicant applicant = app.getApplicant();
        User parent = applicant.getParent();
        return DetailedApplicationResponse.builder()
                .id(app.getId())
                .applicationNumber(app.getApplicationNumber())
                .applicantFirstName(applicant.getFirstName())
                .applicantLastName(applicant.getLastName())
                .gradeApplyingFor(app.getGradeApplyingFor())
                .academicYear(app.getAcademicYear())
                .status(app.getStatus())
                .submissionDate(app.getSubmissionDate())
                .parentName(parent.getFirstName() + " " + parent.getLastName())
                .parentEmail(parent.getEmail())
                .languageProficiency(applicant.getLanguageProficiency())
                .nationalId(applicant.getNationalId())
                .nationalExamIndexNumber(applicant.getNationalExamIndexNumber())
                .combination(applicant.getCombination())
                .province(applicant.getProvince())
                .district(applicant.getDistrict())
                .sector(applicant.getSector())
                .cell(applicant.getCell())
                .village(applicant.getVillage())
                .ubudeheCategory(applicant.getUbudeheCategory())
                .build();
    }
}
