package com.iseas.ise_as_backend.dto.reporting;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CapacityReport {
    private String academicYear;
    private String schoolName;
    private List<GradeCapacityDto> grades;
    private long totalCapacity;
    private long totalEnrolled;
    private long totalAvailable;
}
