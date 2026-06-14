package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.dto.AuthenticationRequest;
import com.iseas.ise_as_backend.dto.AuthenticationResponse;
import com.iseas.ise_as_backend.dto.RegisterRequest;
import com.iseas.ise_as_backend.model.School;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.SchoolRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import com.iseas.ise_as_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    private final UserRepository repository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AuditService auditService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email address already exists.");
        }

        School school = null;
        if (request.getSchoolId() != null) {
            school = schoolRepository.findById(request.getSchoolId()).orElse(null);
        }

        String verificationToken = UUID.randomUUID().toString();

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .school(school)
                .enabled(true)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .build();
        repository.save(user);

        emailService.sendVerificationEmail(request.getEmail(), verificationToken);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .emailVerified(false)
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        // Check lockout
        if (!user.isAccountNonLocked()) {
            throw new LockedException("Account is temporarily locked due to too many failed login attempts. Please try again later.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                log.warn("Account locked for user {} after {} failed attempts", request.getEmail(), attempts);
            }
            repository.save(user);
            auditService.recordLoginFailed(request.getEmail(), null);
            throw new RuntimeException("Invalid email or password.");
        }

        // Successful login — reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        repository.save(user);
        auditService.recordLogin(request.getEmail(), null);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        var user = repository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token."));
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        repository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        // Always return without error to prevent email enumeration
        repository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
            repository.save(user);
            emailService.sendPasswordResetEmail(email, token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        var user = repository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));

        if (user.getPasswordResetTokenExpiresAt() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiresAt())) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        repository.save(user);
    }

    public AuthenticationResponse refreshToken(String oldToken) {
        String email = jwtService.extractUsername(oldToken);
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (!jwtService.isTokenValid(oldToken, user)) {
            throw new RuntimeException("Token is invalid or expired.");
        }
        var newToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(newToken)
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}
