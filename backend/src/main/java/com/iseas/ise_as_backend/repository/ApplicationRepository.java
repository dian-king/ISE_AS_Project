package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findBySchoolId(UUID schoolId);
}
