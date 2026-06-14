package com.iseas.ise_as_backend.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeCapacityDto {
    private String grade;
    private int totalCapacity;
    private long enrolled;
    private long pending;
    private long availableSpots;
    private double fillRate;
}
