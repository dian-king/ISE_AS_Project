package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.dto.ApplicationSubmissionRequest;
import com.iseas.ise_as_backend.dto.DashboardStats;
import com.iseas.ise_as_backend.dto.DetailedApplicationResponse;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.ApplicantRepository;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
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
    private final EmailService emailService;

    @Transactional
    public Application submitApplication(ApplicationSubmissionRequest request) {
        // 1. Get the current logged-in user (parent)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User parent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find the program
        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found"));

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

        // 4. Create Application
        Application application = Application.builder()
                .applicant(applicant)
                .school(program.getSchool())
                .gradeApplyingFor(program.getName())
                .academicYear("2026-2027")
                .status(ApplicationStatus.SUBMITTED)
                .submissionDate(LocalDateTime.now())
                .build();

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

        // Send Email Notification
        try {
            String parentEmail = application.getApplicant().getParent().getEmail();
            String studentName = application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName();
            emailService.sendStatusUpdateEmail(parentEmail, studentName, status.toString());
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
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
        return DetailedApplicationResponse.builder()
                .id(app.getId())
                .applicantFirstName(applicant.getFirstName())
                .applicantLastName(applicant.getLastName())
                .gradeApplyingFor(app.getGradeApplyingFor())
                .status(app.getStatus())
                .submissionDate(app.getSubmissionDate())
                .parentName(applicant.getParent().getFirstName() + " " + applicant.getParent().getLastName())
                .parentEmail(applicant.getParent().getEmail())
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
