package com.iseas.ise_as_backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ReviewAssignmentRequest {
    private UUID applicationId;
    private UUID reviewerId;
}
