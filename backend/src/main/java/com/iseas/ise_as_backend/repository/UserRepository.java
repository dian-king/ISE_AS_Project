package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Role;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);

    List<User> findBySchoolId(UUID schoolId);
    List<User> findBySchoolIdAndRole(UUID schoolId, Role role);
    List<User> findBySchoolIdAndStatus(UUID schoolId, UserStatus status);
    long countBySchoolId(UUID schoolId);
}
