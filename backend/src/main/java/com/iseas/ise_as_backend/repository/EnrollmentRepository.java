package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    Optional<Enrollment> findByOfferId(UUID offerId);
    List<Enrollment> findByApplicantParentEmail(String parentEmail);
    Optional<Enrollment> findByApplicantId(UUID applicantId);
}
