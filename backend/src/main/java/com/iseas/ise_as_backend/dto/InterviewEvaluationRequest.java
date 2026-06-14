package com.iseas.ise_as_backend.dto;

import lombok.Data;

@Data
public class InterviewEvaluationRequest {
    private Integer communicationScore;
    private Integer confidenceScore;
    private Integer academicReadinessScore;
    private Integer languageScore;
    private Integer behavioralScore;
    private Integer criticalThinkingScore;
    private String outcome; // PASS, CONDITIONAL_PASS, WAITLIST, FAIL
    private String evaluationNotes;
}
