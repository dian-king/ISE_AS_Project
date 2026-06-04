package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.dto.SchoolPublicDetailsResponse;
import com.iseas.ise_as_backend.model.School;
import com.iseas.ise_as_backend.repository.ProgramRepository;
import com.iseas.ise_as_backend.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;

    @GetMapping("/school/{domain}")
    public ResponseEntity<SchoolPublicDetailsResponse> getSchoolDetails(@PathVariable String domain) {
        School school = schoolRepository.findByDomain(domain)
                .orElseThrow(() -> new RuntimeException("School not found"));

        var programs = programRepository.findBySchoolIdAndActiveTrue(school.getId())
                .stream()
                .map(p -> SchoolPublicDetailsResponse.ProgramDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(SchoolPublicDetailsResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .logoUrl(school.getLogoUrl())
                .primaryColor(school.getPrimaryColor())
                .secondaryColor(school.getSecondaryColor())
                .programs(programs)
                .build());
    }
}
