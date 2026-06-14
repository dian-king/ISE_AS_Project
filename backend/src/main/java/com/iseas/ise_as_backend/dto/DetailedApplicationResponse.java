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
public class DetailedApplicationResponse {
    private UUID id;
    private String applicationNumber;
    private String applicantFirstName;
    private String applicantLastName;
    private String gradeApplyingFor;
    private String academicYear;
    private ApplicationStatus status;
    private LocalDateTime submissionDate;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String languageProficiency;

    // Rwandan Specific Details
    private String nationalId;
    private String nationalExamIndexNumber;
    private String combination;
    private String province;
    private String district;
    private String sector;
    private String cell;
    private String village;
    private String ubudeheCategory;
}
