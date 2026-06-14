package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.model.Application;
import com.iseas.ise_as_backend.model.DecisionType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class LetterGeneratorService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    public String generate(Application application, DecisionType decision, String decisionReason) {
        String studentName = application.getApplicant().getFirstName() + " "
                + application.getApplicant().getLastName();
        String parentName = application.getApplicant().getParent().getFirstName() + " "
                + application.getApplicant().getParent().getLastName();
        String grade = application.getGradeApplyingFor();
        String year = application.getAcademicYear();
        String today = LocalDate.now().format(DATE_FMT);
        String school = application.getSchool().getName();
        String ref = application.getApplicationNumber() != null ? application.getApplicationNumber() : "N/A";

        return switch (decision) {
            case ACCEPTED -> buildAcceptanceLetter(school, today, parentName, studentName, grade, year, ref);
            case REJECTED -> buildRejectionLetter(school, today, parentName, studentName, grade, year, ref, decisionReason);
            case WAITLISTED -> buildWaitlistLetter(school, today, parentName, studentName, grade, year, ref);
        };
    }

    private String buildAcceptanceLetter(String school, String date, String parent, String student,
                                          String grade, String year, String ref) {
        return String.format("""
                %s
                Office of Admissions

                %s

                Dear %s,

                RE: OFFER OF ADMISSION — %s | %s | Academic Year %s

                Reference: %s

                We are delighted to inform you that following a thorough review of the admissions\
                 application submitted for %s, the Admissions Committee of %s has approved an offer\
                 of admission for the above-named student for the academic year %s.

                %s has demonstrated the academic ability, character, and potential that align with\
                 our institutional values and expectations. We warmly welcome your family to the %s\
                 community.

                NEXT STEPS
                ───────────────────────────────────────────────────────
                1. Log in to the admissions portal and formally accept this offer.
                2. Complete the enrollment documentation within 14 days of acceptance.
                3. Pay the enrollment deposit to secure the place.

                Please note that this offer will lapse if not formally accepted within 14 calendar\
                 days of this letter.

                We look forward to welcoming %s and your family.

                Yours sincerely,

                The Admissions Committee
                %s
                """,
                school, date, parent, student, grade, year, ref,
                student, school, year, student, school, student, school);
    }

    private String buildRejectionLetter(String school, String date, String parent, String student,
                                         String grade, String year, String ref, String reason) {
        String reasonText = (reason != null && !reason.isBlank())
                ? "\nThe committee noted the following: " + reason + "\n"
                : "";
        return String.format("""
                %s
                Office of Admissions

                %s

                Dear %s,

                RE: ADMISSIONS DECISION — %s | %s | Academic Year %s

                Reference: %s

                Thank you for submitting an admissions application for %s to %s for the academic\
                 year %s.

                After careful and thorough deliberation by the Admissions Committee, we regret to\
                 inform you that we are unable to offer a place at this time.
                %s
                We understand this news may be disappointing. We want to assure you that this\
                 decision was made with full and careful consideration of all materials submitted.

                We thank you for your interest in %s and wish %s every success in their academic\
                 journey.

                Yours sincerely,

                The Admissions Committee
                %s
                """,
                school, date, parent, student, grade, year, ref,
                student, school, year, reasonText, school, student, school);
    }

    private String buildWaitlistLetter(String school, String date, String parent, String student,
                                        String grade, String year, String ref) {
        return String.format("""
                %s
                Office of Admissions

                %s

                Dear %s,

                RE: WAITLIST NOTIFICATION — %s | %s | Academic Year %s

                Reference: %s

                Thank you for submitting an admissions application for %s to %s for the academic\
                 year %s.

                After careful review by the Admissions Committee, we wish to inform you that %s\
                 has been placed on our waitlist for the above programme. This means that while\
                 we are unable to offer an immediate place, the application has been retained for\
                 consideration should a vacancy arise.

                We will contact you as soon as possible if a place becomes available. No further\
                 action is required from your side at this time.

                We appreciate your interest in %s and thank you for your patience.

                Yours sincerely,

                The Admissions Committee
                %s
                """,
                school, date, parent, student, grade, year, ref,
                student, school, year, student, school, school);
    }
}
