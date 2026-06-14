package com.iseas.ise_as_backend.dto.reporting;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdmissionsFunnelReport {

    private String schoolName;
    private String academicYear;

    /** Count per ApplicationStatus — admissions pipeline view. */
    private List<FunnelStageDto> pipeline;

    /** Applications grouped by grade/programme. */
    private List<FunnelStageDto> byGrade;

    /** Applications grouped by applicant nationality. */
    private List<FunnelStageDto> byNationality;

    // ── KPI summary ───────────────────────────────────────────────────────────
    private long totalApplications;
    private long submitted;
    private long underReview;
    private long accepted;
    private long rejected;
    private long waitlisted;
    private long enrolled;

    /** Acceptance rate = accepted / submitted (excluding DRAFT). */
    private double acceptanceRate;

    /** Yield rate = enrolled / accepted. */
    private double yieldRate;
}
