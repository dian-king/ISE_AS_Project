package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.ApplicationSubmissionRequest;
import com.iseas.ise_as_backend.dto.DashboardStats;
import com.iseas.ise_as_backend.dto.DetailedApplicationResponse;
import com.iseas.ise_as_backend.model.Application;
import com.iseas.ise_as_backend.model.ApplicationStatus;
import com.iseas.ise_as_backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<Application> submitApplication(@RequestBody ApplicationSubmissionRequest request) {
        return ResponseEntity.ok(applicationService.submitApplication(request));
    }

    @GetMapping
    public ResponseEntity<List<DetailedApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetailedApplicationResponse> getApplicationById(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status
    ) {
        applicationService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(applicationService.getStats());
    }
}
