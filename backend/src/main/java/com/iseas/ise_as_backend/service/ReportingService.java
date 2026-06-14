package com.iseas.ise_as_backend.service;

import com.iseas.ise_as_backend.dto.reporting.*;
import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import com.iseas.ise_as_backend.model.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final ApplicationRepository applicationRepository;
    private final ProgramRepository programRepository;

    // ── Admissions Funnel ─────────────────────────────────────────────────────

    public AdmissionsFunnelReport getAdmissionsFunnel(UUID schoolId, String academicYear) {
        List<Object[]> statusCounts = applicationRepository.countByStatusForSchool(schoolId, academicYear);
        List<Object[]> gradeCounts  = applicationRepository.countByGradeForSchool(schoolId, academicYear);
        List<Object[]> nationalityCounts = applicationRepository.countByNationalityForSchool(schoolId, academicYear);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            byStatus.put(((ApplicationStatus) row[0]).name(), (Long) row[1]);
        }

        long total    = byStatus.values().stream().mapToLong(Long::longValue).sum();
        long accepted = byStatus.getOrDefault("ACCEPTED", 0L)
                      + byStatus.getOrDefault("OFFER_ACCEPTED", 0L)
                      + byStatus.getOrDefault("ENROLLMENT_PENDING", 0L)
                      + byStatus.getOrDefault("ENROLLED", 0L);
        long enrolled = byStatus.getOrDefault("ENROLLED", 0L);
        long submitted = total - byStatus.getOrDefault("DRAFT", 0L);

        double acceptanceRate = submitted > 0 ? (double) accepted / submitted * 100 : 0.0;
        double yieldRate      = accepted > 0  ? (double) enrolled / accepted * 100  : 0.0;

        List<FunnelStageDto> pipeline = new ArrayList<>();
        for (Object[] row : statusCounts) {
            pipeline.add(new FunnelStageDto(((ApplicationStatus) row[0]).name(), (Long) row[1]));
        }

        List<FunnelStageDto> byGrade = gradeCounts.stream()
                .map(r -> new FunnelStageDto((String) r[0], (Long) r[1]))
                .collect(Collectors.toList());

        List<FunnelStageDto> byNationality = nationalityCounts.stream()
                .map(r -> new FunnelStageDto(r[0] != null ? (String) r[0] : "Unknown", (Long) r[1]))
                .collect(Collectors.toList());

        String schoolName = programRepository.findBySchoolIdAndActiveTrue(schoolId).stream()
                .findFirst().map(p -> p.getSchool().getName()).orElse("School");

        return AdmissionsFunnelReport.builder()
                .schoolName(schoolName)
                .academicYear(academicYear)
                .pipeline(pipeline)
                .byGrade(byGrade)
                .byNationality(byNationality)
                .totalApplications(total)
                .submitted(submitted)
                .underReview(byStatus.getOrDefault("ACADEMIC_REVIEW", 0L)
                           + byStatus.getOrDefault("COMMITTEE_REVIEW", 0L))
                .accepted(accepted)
                .rejected(byStatus.getOrDefault("REJECTED", 0L))
                .waitlisted(byStatus.getOrDefault("WAITLISTED", 0L))
                .enrolled(enrolled)
                .acceptanceRate(round2(acceptanceRate))
                .yieldRate(round2(yieldRate))
                .build();
    }

    // ── Conversion Metrics ────────────────────────────────────────────────────

    public ConversionReport getConversionReport(UUID schoolId, String academicYear) {
        long total       = applicationRepository.countBySchoolAndYear(schoolId, academicYear);
        long submitted   = total - applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.DRAFT);
        long reviewed    = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ACADEMIC_REVIEW)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.COMMITTEE_REVIEW);
        long interviewed = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.INTERVIEW_COMPLETED);
        long decisions   = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ACCEPTED)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.REJECTED)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.WAITLISTED);
        long accepted    = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ACCEPTED)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.OFFER_ACCEPTED)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ENROLLMENT_PENDING)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ENROLLED);
        long offAccepted = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.OFFER_ACCEPTED)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ENROLLMENT_PENDING)
                         + applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ENROLLED);
        long enrolled    = applicationRepository.countBySchoolAndYearAndStatus(schoolId, academicYear, ApplicationStatus.ENROLLED);

        return ConversionReport.builder()
                .academicYear(academicYear)
                .totalApplications(total)
                .submittedApplications(submitted)
                .reviewedApplications(reviewed)
                .interviewedApplications(interviewed)
                .decisionsMade(decisions)
                .accepted(accepted)
                .offersAccepted(offAccepted)
                .enrolled(enrolled)
                .submissionRate(round2(rate(submitted, total)))
                .reviewToSubmissionRate(round2(rate(reviewed, submitted)))
                .interviewToReviewRate(round2(rate(interviewed, reviewed)))
                .decisionToInterviewRate(round2(rate(decisions, interviewed)))
                .acceptanceRate(round2(rate(accepted, decisions)))
                .offerAcceptanceRate(round2(rate(offAccepted, accepted)))
                .enrollmentConversionRate(round2(rate(enrolled, offAccepted)))
                .overallConversionRate(round2(rate(enrolled, submitted)))
                .build();
    }

    // ── Capacity Report ───────────────────────────────────────────────────────

    public CapacityReport getCapacityReport(UUID schoolId, String academicYear) {
        List<Program> programs = programRepository.findBySchoolIdAndActiveTrue(schoolId);

        // Enrolled per grade from applications
        Map<String, Long> enrolledByGrade = applicationRepository
                .enrolledCountByGrade(schoolId, academicYear, ApplicationStatus.ENROLLED)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        // Pending (submitted but not yet enrolled or rejected) per grade
        Map<String, Long> pendingByGrade = applicationRepository
                .countByGradeForSchool(schoolId, academicYear)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        List<GradeCapacityDto> grades = new ArrayList<>();
        long totalCapacity = 0, totalEnrolled = 0;

        for (Program p : programs) {
            int cap = p.getCapacity() != null ? p.getCapacity() : 0;
            long enr = enrolledByGrade.getOrDefault(p.getName(), 0L);
            long pend = pendingByGrade.getOrDefault(p.getName(), 0L) - enr;
            long avail = Math.max(0, cap - enr);

            grades.add(GradeCapacityDto.builder()
                    .grade(p.getName())
                    .totalCapacity(cap)
                    .enrolled(enr)
                    .pending(Math.max(0, pend))
                    .availableSpots(avail)
                    .fillRate(round2(cap > 0 ? (double) enr / cap * 100 : 0.0))
                    .build());

            totalCapacity += cap;
            totalEnrolled += enr;
        }

        String schoolName = programs.stream().findFirst()
                .map(p -> p.getSchool().getName()).orElse("School");

        return CapacityReport.builder()
                .academicYear(academicYear)
                .schoolName(schoolName)
                .grades(grades)
                .totalCapacity(totalCapacity)
                .totalEnrolled(totalEnrolled)
                .totalAvailable(Math.max(0, totalCapacity - totalEnrolled))
                .build();
    }

    // ── CSV Export ────────────────────────────────────────────────────────────

    public byte[] exportCsv(UUID schoolId, String academicYear, String report) {
        StringBuilder sb = new StringBuilder();
        switch (report.toLowerCase()) {
            case "admissions" -> {
                AdmissionsFunnelReport r = getAdmissionsFunnel(schoolId, academicYear);
                sb.append("Stage,Count\n");
                r.getPipeline().forEach(s -> sb.append(s.getStage()).append(",").append(s.getCount()).append("\n"));
                sb.append("\nGrade,Applications\n");
                r.getByGrade().forEach(s -> sb.append(s.getStage()).append(",").append(s.getCount()).append("\n"));
                sb.append("\nNationality,Applications\n");
                r.getByNationality().forEach(s -> sb.append(s.getStage()).append(",").append(s.getCount()).append("\n"));
                sb.append("\nKPI,Value\n");
                sb.append("Total Applications,").append(r.getTotalApplications()).append("\n");
                sb.append("Accepted,").append(r.getAccepted()).append("\n");
                sb.append("Enrolled,").append(r.getEnrolled()).append("\n");
                sb.append("Acceptance Rate (%),").append(r.getAcceptanceRate()).append("\n");
                sb.append("Yield Rate (%),").append(r.getYieldRate()).append("\n");
            }
            case "conversion" -> {
                ConversionReport r = getConversionReport(schoolId, academicYear);
                sb.append("Metric,Value\n");
                sb.append("Academic Year,").append(r.getAcademicYear()).append("\n");
                sb.append("Total Applications,").append(r.getTotalApplications()).append("\n");
                sb.append("Submitted,").append(r.getSubmittedApplications()).append("\n");
                sb.append("Reviewed,").append(r.getReviewedApplications()).append("\n");
                sb.append("Interviewed,").append(r.getInterviewedApplications()).append("\n");
                sb.append("Decisions Made,").append(r.getDecisionsMade()).append("\n");
                sb.append("Accepted,").append(r.getAccepted()).append("\n");
                sb.append("Offers Accepted,").append(r.getOffersAccepted()).append("\n");
                sb.append("Enrolled,").append(r.getEnrolled()).append("\n");
                sb.append("Submission Rate (%),").append(r.getSubmissionRate()).append("\n");
                sb.append("Acceptance Rate (%),").append(r.getAcceptanceRate()).append("\n");
                sb.append("Offer Acceptance Rate (%),").append(r.getOfferAcceptanceRate()).append("\n");
                sb.append("Overall Conversion Rate (%),").append(r.getOverallConversionRate()).append("\n");
            }
            case "capacity" -> {
                CapacityReport r = getCapacityReport(schoolId, academicYear);
                sb.append("Grade,Capacity,Enrolled,Pending,Available,Fill Rate (%)\n");
                r.getGrades().forEach(g ->
                    sb.append(g.getGrade()).append(",")
                      .append(g.getTotalCapacity()).append(",")
                      .append(g.getEnrolled()).append(",")
                      .append(g.getPending()).append(",")
                      .append(g.getAvailableSpots()).append(",")
                      .append(g.getFillRate()).append("\n")
                );
                sb.append("\nTotal,").append(r.getTotalCapacity()).append(",")
                  .append(r.getTotalEnrolled()).append(",,,\n");
            }
            default -> sb.append("Unknown report type: ").append(report);
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    // ── Excel Export ──────────────────────────────────────────────────────────

    public byte[] exportExcel(UUID schoolId, String academicYear, String report) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            switch (report.toLowerCase()) {
                case "admissions" -> buildAdmissionsSheet(wb, headerStyle, schoolId, academicYear);
                case "conversion"  -> buildConversionSheet(wb, headerStyle, schoolId, academicYear);
                case "capacity"    -> buildCapacitySheet(wb, headerStyle, schoolId, academicYear);
                default -> {
                    Sheet s = wb.createSheet("Error");
                    s.createRow(0).createCell(0).setCellValue("Unknown report type: " + report);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void buildAdmissionsSheet(Workbook wb, CellStyle hs, UUID schoolId, String academicYear) {
        AdmissionsFunnelReport r = getAdmissionsFunnel(schoolId, academicYear);

        Sheet pipeline = wb.createSheet("Pipeline");
        writeHeader(pipeline, hs, "Stage", "Count");
        r.getPipeline().forEach(s -> writeRow(pipeline, s.getStage(), s.getCount()));

        Sheet byGrade = wb.createSheet("By Grade");
        writeHeader(byGrade, hs, "Grade", "Applications");
        r.getByGrade().forEach(s -> writeRow(byGrade, s.getStage(), s.getCount()));

        Sheet byNat = wb.createSheet("By Nationality");
        writeHeader(byNat, hs, "Nationality", "Applications");
        r.getByNationality().forEach(s -> writeRow(byNat, s.getStage(), s.getCount()));

        Sheet kpi = wb.createSheet("KPIs");
        writeHeader(kpi, hs, "KPI", "Value");
        writeRow(kpi, "Academic Year", r.getAcademicYear());
        writeRow(kpi, "Total Applications", r.getTotalApplications());
        writeRow(kpi, "Submitted", r.getSubmitted());
        writeRow(kpi, "Accepted", r.getAccepted());
        writeRow(kpi, "Rejected", r.getRejected());
        writeRow(kpi, "Waitlisted", r.getWaitlisted());
        writeRow(kpi, "Enrolled", r.getEnrolled());
        writeRow(kpi, "Acceptance Rate (%)", r.getAcceptanceRate());
        writeRow(kpi, "Yield Rate (%)", r.getYieldRate());
    }

    private void buildConversionSheet(Workbook wb, CellStyle hs, UUID schoolId, String academicYear) {
        ConversionReport r = getConversionReport(schoolId, academicYear);
        Sheet s = wb.createSheet("Conversion Metrics");
        writeHeader(s, hs, "Metric", "Value");
        writeRow(s, "Academic Year",                r.getAcademicYear());
        writeRow(s, "Total Applications",           r.getTotalApplications());
        writeRow(s, "Submitted",                    r.getSubmittedApplications());
        writeRow(s, "Reviewed",                     r.getReviewedApplications());
        writeRow(s, "Interviewed",                  r.getInterviewedApplications());
        writeRow(s, "Decisions Made",               r.getDecisionsMade());
        writeRow(s, "Accepted",                      r.getAccepted());
        writeRow(s, "Offers Accepted",              r.getOffersAccepted());
        writeRow(s, "Enrolled",                     r.getEnrolled());
        writeRow(s, "Submission Rate (%)",          r.getSubmissionRate());
        writeRow(s, "Review Rate (%)",              r.getReviewToSubmissionRate());
        writeRow(s, "Interview Rate (%)",           r.getInterviewToReviewRate());
        writeRow(s, "Acceptance Rate (%)",          r.getAcceptanceRate());
        writeRow(s, "Offer Acceptance Rate (%)",    r.getOfferAcceptanceRate());
        writeRow(s, "Enrollment Conversion (%)",    r.getEnrollmentConversionRate());
        writeRow(s, "Overall Conversion Rate (%)",  r.getOverallConversionRate());
    }

    private void buildCapacitySheet(Workbook wb, CellStyle hs, UUID schoolId, String academicYear) {
        CapacityReport r = getCapacityReport(schoolId, academicYear);
        Sheet s = wb.createSheet("Capacity");
        writeHeader(s, hs, "Grade", "Capacity", "Enrolled", "Pending", "Available", "Fill Rate (%)");
        r.getGrades().forEach(g -> {
            Row row = s.createRow(s.getLastRowNum() + 1);
            row.createCell(0).setCellValue(g.getGrade());
            row.createCell(1).setCellValue(g.getTotalCapacity());
            row.createCell(2).setCellValue(g.getEnrolled());
            row.createCell(3).setCellValue(g.getPending());
            row.createCell(4).setCellValue(g.getAvailableSpots());
            row.createCell(5).setCellValue(g.getFillRate());
        });
        Row total = s.createRow(s.getLastRowNum() + 1);
        total.createCell(0).setCellValue("TOTAL");
        total.createCell(1).setCellValue(r.getTotalCapacity());
        total.createCell(2).setCellValue(r.getTotalEnrolled());
        total.createCell(4).setCellValue(r.getTotalAvailable());
        for (int i = 0; i < 6; i++) s.autoSizeColumn(i);
    }

    private void writeHeader(Sheet sheet, CellStyle style, String... headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void writeRow(Sheet sheet, String label, Object value) {
        Row row = sheet.createRow(sheet.getLastRowNum() + 1);
        row.createCell(0).setCellValue(label);
        if (value instanceof Number n) {
            row.createCell(1).setCellValue(n.doubleValue());
        } else {
            row.createCell(1).setCellValue(value != null ? value.toString() : "");
        }
    }

    private double rate(long numerator, long denominator) {
        return denominator > 0 ? (double) numerator / denominator * 100 : 0.0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
