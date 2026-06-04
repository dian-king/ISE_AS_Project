package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApplicantRepository extends JpaRepository<Applicant, UUID> {
}
