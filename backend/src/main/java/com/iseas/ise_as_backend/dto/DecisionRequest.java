package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.DecisionType;
import lombok.Data;
import java.util.UUID;

@Data
public class DecisionRequest {
    private UUID applicationId;
    private DecisionType decision;
    private String decisionReason;
}
