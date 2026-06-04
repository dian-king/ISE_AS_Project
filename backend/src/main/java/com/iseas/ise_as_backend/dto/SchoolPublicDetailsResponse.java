package com.iseas.ise_as_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SchoolPublicDetailsResponse {
    private UUID id;
    private String name;
    private String logoUrl;
    private String primaryColor;
    private String secondaryColor;
    private List<ProgramDto> programs;

    @Data
    @Builder
    public static class ProgramDto {
        private UUID id;
        private String name;
        private String description;
    }
}
