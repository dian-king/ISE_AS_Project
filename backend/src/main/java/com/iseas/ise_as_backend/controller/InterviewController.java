package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.ScheduleInterviewRequest;
import com.iseas.ise_as_backend.model.Application;
import com.iseas.ise_as_backend.model.ApplicationStatus;
import com.iseas.ise_as_backend.model.Interview;
import com.iseas.ise_as_backend.repository.ApplicationRepository;
import com.iseas.ise_as_backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping("/schedule")
    @Transactional
    public ResponseEntity<Interview> scheduleInterview(@RequestBody ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Interview interview = Interview.builder()
                .application(application)
                .interviewDate(request.getInterviewDate())
                .location(request.getLocation())
                .notes(request.getNotes())
                .build();

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        return ResponseEntity.ok(interviewRepository.save(interview));
    }
}
