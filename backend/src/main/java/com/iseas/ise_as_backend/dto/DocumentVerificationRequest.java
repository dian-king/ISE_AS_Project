package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.DocumentVerificationStatus;
import lombok.Data;

@Data
public class DocumentVerificationRequest {
    private DocumentVerificationStatus status;
    private String rejectionReason;
}
