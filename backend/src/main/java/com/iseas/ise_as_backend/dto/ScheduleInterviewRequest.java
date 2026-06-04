package com.iseas.ise_as_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ScheduleInterviewRequest {
    private UUID applicationId;
    private LocalDateTime interviewDate;
    private String location;
    private String notes;
}
