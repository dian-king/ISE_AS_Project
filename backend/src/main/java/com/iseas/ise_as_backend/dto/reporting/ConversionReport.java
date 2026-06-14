package com.iseas.ise_as_backend.dto.reporting;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversionReport {

    private String academicYear;

    // Stage counts
    private long totalApplications;
    private long submittedApplications;
    private long reviewedApplications;
    private long interviewedApplications;
    private long decisionsMade;
    private long accepted;
    private long offersAccepted;
    private long enrolled;

    // Stage-to-stage conversion rates (%)
    /** Submitted / total */
    private double submissionRate;
    /** reviewed / submitted */
    private double reviewToSubmissionRate;
    /** interviewed / reviewed */
    private double interviewToReviewRate;
    /** decisions / interviewed */
    private double decisionToInterviewRate;
    /** accepted / decisions */
    private double acceptanceRate;
    /** offersAccepted / accepted */
    private double offerAcceptanceRate;
    /** enrolled / offersAccepted */
    private double enrollmentConversionRate;
    /** enrolled / submitted (overall funnel efficiency) */
    private double overallConversionRate;
}
