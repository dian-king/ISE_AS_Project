package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByStudentNumber(String studentNumber);
    Optional<Student> findByApplicantId(UUID applicantId);
    Optional<Student> findByEnrollmentId(UUID enrollmentId);
    boolean existsByApplicantId(UUID applicantId);
}
