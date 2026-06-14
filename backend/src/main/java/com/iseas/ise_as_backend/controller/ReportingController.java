package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.reporting.AdmissionsFunnelReport;
import com.iseas.ise_as_backend.dto.reporting.CapacityReport;
import com.iseas.ise_as_backend.dto.reporting.ConversionReport;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.UserRepository;
import com.iseas.ise_as_backend.service.ReportingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportingController {

    private final ReportingService reportingService;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/reports/admissions?academicYear=2026-2027
     *
     * Returns the admissions pipeline funnel: counts per status, by grade, by nationality,
     * plus acceptance rate and yield rate KPIs.
     */
    @GetMapping("/admissions")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<AdmissionsFunnelReport> getAdmissionsReport(
            @RequestParam(defaultValue = "") String academicYear,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        String year   = resolveYear(academicYear);
        return ResponseEntity.ok(reportingService.getAdmissionsFunnel(schoolId, year));
    }

    /**
     * GET /api/v1/reports/conversion?academicYear=2026-2027
     *
     * Returns stage-by-stage conversion rates across the full admissions funnel.
     */
    @GetMapping("/conversion")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<ConversionReport> getConversionReport(
            @RequestParam(defaultValue = "") String academicYear,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        String year   = resolveYear(academicYear);
        return ResponseEntity.ok(reportingService.getConversionReport(schoolId, year));
    }

    /**
     * GET /api/v1/reports/capacity?academicYear=2026-2027
     *
     * Returns per-grade capacity vs. enrolled counts.
     */
    @GetMapping("/capacity")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<CapacityReport> getCapacityReport(
            @RequestParam(defaultValue = "") String academicYear,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        String year   = resolveYear(academicYear);
        return ResponseEntity.ok(reportingService.getCapacityReport(schoolId, year));
    }

    /**
     * GET /api/v1/reports/export?report=admissions&format=csv&academicYear=2026-2027
     *
     * Exports the requested report as CSV or Excel.
     * - report: admissions | conversion | capacity  (default: admissions)
     * - format: csv | excel                          (default: csv)
     */
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> export(
            @RequestParam(defaultValue = "admissions") String report,
            @RequestParam(defaultValue = "csv")        String format,
            @RequestParam(defaultValue = "")           String academicYear,
            Authentication auth) {

        UUID schoolId = resolveSchoolId(auth);
        String year   = resolveYear(academicYear);

        try {
            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                byte[] data = reportingService.exportExcel(schoolId, year, report);
                String filename = "iga_afriqa_" + report + "_" + year + ".xlsx";
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                        .body(data);
            } else {
                byte[] data = reportingService.exportCsv(schoolId, year, report);
                String filename = "iga_afriqa_" + report + "_" + year + ".csv";
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.parseMediaType("text/csv"))
                        .body(data);
            }
        } catch (Exception e) {
            log.error("Export failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UUID resolveSchoolId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSchool() == null) {
            throw new RuntimeException("User has no school assigned");
        }
        return user.getSchool().getId();
    }

    /** Returns the provided year or defaults to the current-year → next-year cycle. */
    private String resolveYear(String year) {
        if (year != null && !year.isBlank()) return year;
        int current = LocalDate.now().getYear();
        return current + "-" + (current + 1);
    }
}
