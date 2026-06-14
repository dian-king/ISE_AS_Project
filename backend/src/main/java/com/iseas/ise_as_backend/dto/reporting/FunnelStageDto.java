package com.iseas.ise_as_backend.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FunnelStageDto {
    private String stage;
    private long count;
}
