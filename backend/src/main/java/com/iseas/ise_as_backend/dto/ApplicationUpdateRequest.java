package com.iseas.ise_as_backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ApplicationUpdateRequest {
    private String firstName;
    private String lastName;
    private String dob;
    private String gender;
    private String nationality;
    private UUID programId;

    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String address;

    private String previousSchool;
    private String lastGradeCompleted;
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
