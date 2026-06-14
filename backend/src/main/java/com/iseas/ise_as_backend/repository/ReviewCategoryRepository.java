package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.ReviewCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewCategoryRepository extends JpaRepository<ReviewCategory, UUID> {
    List<ReviewCategory> findBySchoolIdOrderByDisplayOrderAsc(UUID schoolId);
    boolean existsByNameAndSchoolId(String name, UUID schoolId);
}
