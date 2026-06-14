package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.DetailedApplicationResponse;
import com.iseas.ise_as_backend.dto.ReviewerResponse;
import com.iseas.ise_as_backend.model.Role;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import com.iseas.ise_as_backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
public class ParentController {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;

    @GetMapping("/me")
    public ResponseEntity<ReviewerResponse> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ReviewerResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<DetailedApplicationResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }
}
