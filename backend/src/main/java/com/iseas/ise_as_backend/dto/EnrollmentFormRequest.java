package com.iseas.ise_as_backend.dto;

import lombok.Data;

@Data
public class EnrollmentFormRequest {
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String medicalNotes;
    private boolean transportRequired;
    private String uniformSize;
    private String preferredLanguage;
    private String additionalNotes;
}
