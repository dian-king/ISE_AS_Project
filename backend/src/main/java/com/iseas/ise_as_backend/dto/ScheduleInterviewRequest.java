package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.InterviewMode;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ScheduleInterviewRequest {
    private UUID applicationId;
    private LocalDateTime interviewDate;
    private String location;
    private String notes;
    /** Mode of interview — PHYSICAL, ZOOM, TEAMS, or MEET. Defaults to PHYSICAL if omitted. */
    private InterviewMode mode;
    /** Optional: interviewer to assign immediately on scheduling. */
    private UUID interviewerId;
}
