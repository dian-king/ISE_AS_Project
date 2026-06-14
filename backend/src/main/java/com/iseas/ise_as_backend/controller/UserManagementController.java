package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.CreateUserRequest;
import com.iseas.ise_as_backend.dto.UpdateUserRequest;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.SchoolRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import com.iseas.ise_as_backend.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserManagementController {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    // ── Own profile (any authenticated user) ─────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(resolveCurrentUser(auth));
    }

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<User> updateMyProfile(
            @RequestBody UpdateUserRequest request,
            Authentication auth) {
        User user = resolveCurrentUser(auth);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  user.setLastName(request.getLastName());
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ── School user listing ───────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<List<User>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);

        if (role != null && !role.isBlank()) {
            return ResponseEntity.ok(
                    userRepository.findBySchoolIdAndRole(schoolId, Role.valueOf(role.toUpperCase())));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(
                    userRepository.findBySchoolIdAndStatus(schoolId, UserStatus.valueOf(status.toUpperCase())));
        }
        return ResponseEntity.ok(userRepository.findBySchoolId(schoolId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<User> getUser(@PathVariable UUID id, Authentication auth) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Scope check: must belong to the caller's school
        UUID callerSchoolId = resolveSchoolId(auth);
        if (target.getSchool() == null || !target.getSchool().getId().equals(callerSchoolId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(target);
    }

    // ── Create staff user ─────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional
    public ResponseEntity<User> createUser(
            @RequestBody CreateUserRequest request,
            Authentication auth) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("A user with this email already exists.");
        }

        // Staff accounts are not for parents — validate role
        if (request.getRole() == Role.PARENT) {
            throw new RuntimeException("Parent accounts are self-registered and cannot be created here.");
        }

        School school = resolveSchool(auth);

        String rawPassword = request.getTemporaryPassword() != null && !request.getTemporaryPassword().isBlank()
                ? request.getTemporaryPassword()
                : generateTemporaryPassword();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(request.getRole())
                .school(school)
                .enabled(true)
                .emailVerified(true)      // admin-created accounts skip email verification
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);
        log.info("Staff user created: {} ({}) by {}", saved.getEmail(), saved.getRole(), auth.getName());
        auditService.recordCreate("User", saved.getId().toString(),
                "Created staff user " + saved.getEmail() + " with role " + saved.getRole());

        return ResponseEntity.ok(saved);
    }

    // ── Update user role / name ───────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional
    public ResponseEntity<User> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request,
            Authentication auth) {

        User target = findInSchool(id, auth);

        if (request.getFirstName() != null) target.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  target.setLastName(request.getLastName());
        if (request.getRole() != null) {
            if (request.getRole() == Role.PARENT) {
                throw new RuntimeException("Cannot change a staff account's role to PARENT.");
            }
            target.setRole(request.getRole());
        }

        return ResponseEntity.ok(userRepository.save(target));
    }

    // ── Update user status ────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Transactional
    public ResponseEntity<User> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request,
            Authentication auth) {

        User target = findInSchool(id, auth);

        if (request.getStatus() == null) {
            throw new RuntimeException("Status field is required.");
        }

        // Prevent self-suspension
        User caller = resolveCurrentUser(auth);
        if (caller.getId().equals(target.getId())) {
            throw new RuntimeException("You cannot change your own account status.");
        }

        target.setStatus(request.getStatus());
        if (request.getStatus() == UserStatus.DEACTIVATED) {
            target.setEnabled(false);
        } else if (request.getStatus() == UserStatus.ACTIVE) {
            target.setEnabled(true);
        }

        log.info("User {} status set to {} by {}", target.getEmail(), request.getStatus(), auth.getName());
        User updated = userRepository.save(target);
        auditService.record("STATUS_CHANGE", "User", updated.getId().toString(),
                null, request.getStatus().name(), "Status changed by " + auth.getName());
        return ResponseEntity.ok(updated);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private User resolveCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private School resolveSchool(Authentication auth) {
        User user = resolveCurrentUser(auth);
        if (user.getSchool() == null) throw new RuntimeException("User has no school assigned");
        return user.getSchool();
    }

    private UUID resolveSchoolId(Authentication auth) {
        // SUPER_ADMIN and CODAFRIQA_SUPPORT may not have a school — scope via auth only for scoped roles
        User user = resolveCurrentUser(auth);
        if (user.getSchool() == null) throw new RuntimeException("User has no school assigned");
        return user.getSchool().getId();
    }

    private User findInSchool(UUID userId, Authentication auth) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID callerSchoolId = resolveSchoolId(auth);
        if (target.getSchool() == null || !target.getSchool().getId().equals(callerSchoolId)) {
            throw new RuntimeException("Access denied: user does not belong to your school.");
        }
        return target;
    }

    private String generateTemporaryPassword() {
        // 12-char alphanumeric temporary password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(12);
        java.util.Random rng = new java.util.Random();
        for (int i = 0; i < 12; i++) sb.append(chars.charAt(rng.nextInt(chars.length())));
        return sb.toString();
    }
}
