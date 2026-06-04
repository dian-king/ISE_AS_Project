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

        System.out.println("====================================================");
        System.out.println("ISE&AS BACKEND STARTED SUCCESSFULLY");
        System.out.println("PostgreSQL connected and data initialized.");
        System.out.println("====================================================");
    }
}
