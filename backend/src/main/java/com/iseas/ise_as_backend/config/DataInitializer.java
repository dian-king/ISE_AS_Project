package com.iseas.ise_as_backend.config;

import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final ReviewCategoryRepository reviewCategoryRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final AdmissionsCycleRepository admissionsCycleRepository;
    private final WorkflowConfigRepository workflowConfigRepository;
    private final FormSectionRepository formSectionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting Data Initialization...");
        
        // Truncate existing users if necessary to ensure fresh start with known credentials
        // userRepository.deleteAll(); 
        
        School school;
        if (schoolRepository.count() == 0) {
            // 1. Create a Default School
            school = School.builder()
                    .name("Greenwood International School")
                    .domain("greenwood")
                    .primaryColor("#059669") // Emerald 600
                    .secondaryColor("#1e293b") // Slate 800
                    .contactEmail("admissions@greenwood.edu")
                    .build();
            school = schoolRepository.save(school);

            // 2. Create Programs (Rwandan System)
            List<Program> programs = List.of(
                Program.builder().name("Nursery 1 (Baby Class)").school(school).build(),
                Program.builder().name("Nursery 2 (Middle Class)").school(school).build(),
                Program.builder().name("Nursery 3 (Top Class)").school(school).build(),
                Program.builder().name("Primary 1 (P1)").school(school).build(),
                Program.builder().name("Primary 2 (P2)").school(school).build(),
                Program.builder().name("Primary 3 (P3)").school(school).build(),
                Program.builder().name("Primary 4 (P4)").school(school).build(),
                Program.builder().name("Primary 5 (P5)").school(school).build(),
                Program.builder().name("Primary 6 (P6)").school(school).build(),
                Program.builder().name("Senior 1 (S1)").school(school).build(),
                Program.builder().name("Senior 2 (S2)").school(school).build(),
                Program.builder().name("Senior 3 (S3)").school(school).build(),
                Program.builder().name("Senior 4 (S4)").school(school).build(),
                Program.builder().name("Senior 5 (S5)").school(school).build(),
                Program.builder().name("Senior 6 (S6)").school(school).build()
            );
            programRepository.saveAll(programs);
        } else {
            school = schoolRepository.findAll().get(0);
        }

        // Ensure Admin user exists and has a school
        User admin = userRepository.findByEmail("admin@iseas.com").orElse(null);
        if (admin == null) {
            System.out.println("DEBUG: Admin user NOT found. Creating...");
            admin = User.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@iseas.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.SUPER_ADMIN)
                    .school(school)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("DEBUG: Admin user CREATED successfully.");
        } else {
            System.out.println("DEBUG: Admin user already exists. Updating password and school to ensure access.");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setSchool(school);
            admin.setRole(Role.SUPER_ADMIN);
            userRepository.save(admin);
        }

        // Ensure Parent user exists
        User parent = userRepository.findByEmail("parent@test.com").orElse(null);
        if (parent == null) {
            parent = User.builder()
                    .firstName("John")
                    .lastName("Doe")
                    .email("parent@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.PARENT)
                    .school(school)
                    .enabled(true)
                    .build();
            userRepository.save(parent);
        } else {
            parent.setPassword(passwordEncoder.encode("password123"));
            parent.setSchool(school);
            userRepository.save(parent);
        }

        // 4. Create Mock Applicants and Applications if none exist
        if (applicantRepository.count() == 0) {
            Applicant applicant1 = Applicant.builder()
                    .firstName("Alice")
                    .lastName("Doe")
                    .parent(parent)
                    .gender("Female")
                    .nationality("American")
                    .build();
            applicantRepository.save(applicant1);

            Applicant applicant2 = Applicant.builder()
                    .firstName("Bob")
                    .lastName("Smith")
                    .parent(parent)
                    .gender("Male")
                    .nationality("British")
                    .build();
            applicantRepository.save(applicant2);

            java.time.LocalDateTime now = java.time.LocalDateTime.now();

            Application app1 = Application.builder()
                    .applicant(applicant1)
                    .school(school)
                    .gradeApplyingFor("Primary 1 (P1)")
                    .academicYear("2026-2027")
                    .status(ApplicationStatus.SUBMITTED)
                    .submissionDate(now.minusDays(2))
                    .build();
            
            Application app2 = Application.builder()
                    .applicant(applicant2)
                    .school(school)
                    .gradeApplyingFor("Nursery 1 (Baby Class)")
                    .academicYear("2026-2027")
                    .status(ApplicationStatus.UNDER_REVIEW)
                    .submissionDate(now.minusDays(5))
                    .build();

            applicationRepository.saveAll(List.of(app1, app2));
        }

        // Seed default document types if catalogue is empty
        if (documentTypeRepository.count() == 0) {
            final String IMAGES_AND_PDF = "application/pdf,image/jpeg,image/png";
            final String PDF_ONLY = "application/pdf";
            final long MB5 = 5L * 1024 * 1024;
            final long MB10 = 10L * 1024 * 1024;

            documentTypeRepository.saveAll(List.of(
                DocumentType.builder()
                    .name("Birth Certificate")
                    .description("Official birth certificate of the applicant")
                    .required(true)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(IMAGES_AND_PDF)
                    .build(),
                DocumentType.builder()
                    .name("Passport")
                    .description("Valid passport (for non-Rwandan applicants)")
                    .required(false)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(IMAGES_AND_PDF)
                    .build(),
                DocumentType.builder()
                    .name("National ID")
                    .description("Rwandan Indangamuntu (16-digit national ID)")
                    .required(false)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(IMAGES_AND_PDF)
                    .build(),
                DocumentType.builder()
                    .name("Academic Transcript")
                    .description("Official academic transcripts from previous school")
                    .required(true)
                    .maxFileSizeBytes(MB10)
                    .allowedMimeTypes(PDF_ONLY)
                    .build(),
                DocumentType.builder()
                    .name("Report Card")
                    .description("Most recent school report card")
                    .required(true)
                    .maxFileSizeBytes(MB10)
                    .allowedMimeTypes(IMAGES_AND_PDF)
                    .build(),
                DocumentType.builder()
                    .name("Medical Form")
                    .description("Health and immunisation records")
                    .required(false)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(PDF_ONLY)
                    .build(),
                DocumentType.builder()
                    .name("Recommendation Letter")
                    .description("Letter of recommendation from previous school or teacher")
                    .required(false)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(PDF_ONLY)
                    .build(),
                DocumentType.builder()
                    .name("Essay Submission")
                    .description("Applicant personal statement or essay (if required)")
                    .required(false)
                    .maxFileSizeBytes(MB5)
                    .allowedMimeTypes(PDF_ONLY)
                    .build(),
                DocumentType.builder()
                    .name("Portfolio")
                    .description("Creative or academic portfolio (arts / special programmes)")
                    .required(false)
                    .maxFileSizeBytes(MB10)
                    .allowedMimeTypes(IMAGES_AND_PDF)
                    .build()
            ));
        }

        // Seed default review categories for the school if none exist
        if (reviewCategoryRepository.count() == 0) {
            reviewCategoryRepository.saveAll(List.of(
                ReviewCategory.builder().name("Academic Strength")
                    .description("Evaluation of academic performance and potential")
                    .weight(30).displayOrder(1).school(school).build(),
                ReviewCategory.builder().name("Language Ability")
                    .description("Assessment of English and other required language proficiency")
                    .weight(20).displayOrder(2).school(school).build(),
                ReviewCategory.builder().name("Behavioral Assessment")
                    .description("Evaluation of conduct and character based on records")
                    .weight(20).displayOrder(3).school(school).build(),
                ReviewCategory.builder().name("Extracurricular Profile")
                    .description("Assessment of activities and leadership outside academics")
                    .weight(15).displayOrder(4).school(school).build(),
                ReviewCategory.builder().name("Overall Fit")
                    .description("Holistic judgment of applicant fit for the institution")
                    .weight(15).displayOrder(5).school(school).build()
            ));
        }

        // Seed default notification templates (EMAIL + SMS) for all lifecycle events
        if (notificationTemplateRepository.count() == 0) {
            notificationTemplateRepository.saveAll(List.of(

                // APPLICATION_SUBMITTED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.APPLICATION_SUBMITTED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Application Received — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nWe have successfully received the admissions application for {{studentName}}.\n\nReference Number: {{applicationRef}}\nAcademic Year  : {{academicYear}}\n\nOur team will review your application and be in touch within 5–7 business days.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.APPLICATION_SUBMITTED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Amwemezo y'ubusabe bwa {{studentName}} yakirwe. Ref: {{applicationRef}}. Twabakontora mu minsi 5-7 y'akazi.")
                    .build(),

                // DOCUMENT_UPLOADED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DOCUMENT_UPLOADED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Document Received — {{documentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nWe have received your document '{{documentName}}' for the application of {{studentName}} (Ref: {{applicationRef}}).\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DOCUMENT_UPLOADED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Inyandiko '{{documentName}}' ya {{studentName}} yakirwe neza.")
                    .build(),

                // DOCUMENT_REJECTED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DOCUMENT_REJECTED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Action Required: Document Rejected — {{documentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nThe document '{{documentName}}' submitted for {{studentName}} has been rejected.\n\nReason: {{reason}}\n\nPlease log in to the portal to upload a replacement document.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DOCUMENT_REJECTED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Inyandiko '{{documentName}}' ya {{studentName}} yanzwe. Injira muri portail kugira usubmite indi.")
                    .build(),

                // REVIEW_ASSIGNED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.REVIEW_ASSIGNED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Review Assignment — {{studentName}}")
                    .bodyTemplate("Dear {{reviewerName}},\n\nYou have been assigned to review the admissions application for {{studentName}} (Ref: {{applicationRef}}).\n\nPlease log in to the portal to complete your review.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.REVIEW_ASSIGNED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Wahawe isuzuma ry'ubusabe bwa {{studentName}} (Ref: {{applicationRef}}). Injira muri portail.")
                    .build(),

                // INTERVIEW_SCHEDULED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.INTERVIEW_SCHEDULED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Interview Scheduled — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nAn interview has been scheduled for {{studentName}}.\n\nDate & Time : {{dateTime}}\nMode        : {{mode}}\nLocation    : {{location}}\n\nPlease arrive 10 minutes early. Contact us if you need to reschedule.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.INTERVIEW_SCHEDULED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Ikiganiro cy'ubusabe bwa {{studentName}} giteganyijwe ku {{dateTime}} ({{mode}}). Aho: {{location}}.")
                    .build(),

                // DECISION_RELEASED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DECISION_RELEASED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Admissions Decision — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nA formal admissions decision has been made for {{studentName}}.\n\nDecision: {{decision}}\n\n{{letterContent}}\n\nLog in to the portal to view your full decision letter and next steps.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.DECISION_RELEASED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Icyemezo cy'ubusabe bwa {{studentName}} cyafashwe: {{decision}}. Injira muri portail kureba amakuru.")
                    .build(),

                // OFFER_ISSUED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.OFFER_ISSUED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Offer of Admission — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nCongratulations! An offer of admission has been issued for {{studentName}}.\n\nOffer Expiry : {{offerExpiry}}\n\nPlease log in to the portal to accept or decline this offer.\n\nBest regards,\nAdmissions Team")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.OFFER_ISSUED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Amakuru meza! {{studentName}} yahawe offer y'kwinjira. Injira muri portail kuyemera cyangwa guyanga. Igenamigambi: {{offerExpiry}}.")
                    .build(),

                // ENROLLMENT_STARTED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.ENROLLMENT_STARTED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Enrollment Started — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nThe enrollment process for {{studentName}} has been started.\n\nPlease log in to the portal to complete the enrollment form.\n\nBest regards,\nRegistrar's Office")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.ENROLLMENT_STARTED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: Kwandikisha kwa {{studentName}} kwaratangiye. Injira muri portail urangize uburyo.")
                    .build(),

                // ENROLLMENT_CONFIRMED
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.ENROLLMENT_CONFIRMED)
                    .channel(NotificationChannel.EMAIL)
                    .subjectTemplate("Enrollment Confirmed — {{studentName}}")
                    .bodyTemplate("Dear {{parentName}},\n\nWe are pleased to confirm that {{studentName}} has been successfully enrolled.\n\nStudent Number : {{studentNumber}}\nProgramme      : {{grade}}\nAcademic Year  : {{academicYear}}\n\nPlease quote the student number in all future correspondence.\n\nBest regards,\nRegistrar's Office")
                    .build(),
                NotificationTemplate.builder()
                    .eventType(NotificationEventType.ENROLLMENT_CONFIRMED)
                    .channel(NotificationChannel.SMS)
                    .subjectTemplate("")
                    .bodyTemplate("Iga Afriqa: {{studentName}} yandikishijwe neza. Inomero: {{studentNumber}}. Murakoze guhitamo ishuri ryacu!")
                    .build()
            ));
        }

        // Seed default admissions cycle for the current year
        if (admissionsCycleRepository.count() == 0) {
            int year = java.time.LocalDate.now().getYear();
            admissionsCycleRepository.save(
                AdmissionsCycle.builder()
                    .school(school)
                    .academicYear(year + "-" + (year + 1))
                    .name("Admissions " + year + "-" + (year + 1))
                    .openDate(java.time.LocalDate.of(year, 1, 15))
                    .closeDate(java.time.LocalDate.of(year, 6, 30))
                    .generalDeadline(java.time.LocalDate.of(year, 5, 31))
                    .active(true)
                    .build()
            );
        }

        // Seed default school-level workflow config
        if (workflowConfigRepository.count() == 0) {
            workflowConfigRepository.save(
                WorkflowConfig.builder()
                    .school(school)
                    .grade(null) // school-wide default
                    .interviewRequirement("OPTIONAL")
                    .reviewRounds(1)
                    .committeeMinMembers(1)
                    .principalApprovalRequired(true)
                    .build()
            );
        }

        // Seed default application form sections
        if (formSectionRepository.count() == 0) {
            formSectionRepository.saveAll(List.of(
                FormSection.builder().school(school).name("Student Information")
                    .description("Basic personal details of the applicant")
                    .displayOrder(1).enabled(true).build(),
                FormSection.builder().school(school).name("Parent / Guardian Information")
                    .description("Contact and relationship details of the parent or guardian")
                    .displayOrder(2).enabled(true).build(),
                FormSection.builder().school(school).name("Academic History")
                    .description("Previous school, grade, and academic performance details")
                    .displayOrder(3).enabled(true).build(),
                FormSection.builder().school(school).name("Medical Information")
                    .description("Health conditions, allergies, and immunisation status")
                    .displayOrder(4).enabled(true).build(),
                FormSection.builder().school(school).name("Language Proficiency")
                    .description("Language background and proficiency levels")
                    .displayOrder(5).enabled(true).build(),
                FormSection.builder().school(school).name("Additional Information")
                    .description("Extracurricular activities, special needs, and other notes")
                    .displayOrder(6).enabled(true).build()
            ));
        }

        System.out.println("====================================================");
        System.out.println("ISE&AS BACKEND STARTED SUCCESSFULLY");
        System.out.println("PostgreSQL connected and data initialized.");
        System.out.println("====================================================");
    }
}
