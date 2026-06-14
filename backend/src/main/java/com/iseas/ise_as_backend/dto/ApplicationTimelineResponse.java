package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationTimelineResponse {
    private UUID id;
    private ApplicationStatus status;
    private String changedBy;
    private String notes;
    private LocalDateTime changedAt;
}
