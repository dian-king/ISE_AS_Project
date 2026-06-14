package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.*;
import com.iseas.ise_as_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Module 11 — Configuration Engine
 *
 * All endpoints are scoped to the caller's school (resolved from JWT).
 * Intended for SCHOOL_ADMINISTRATOR and SUPER_ADMIN roles.
 *
 * Base: /api/v1/config
 */
@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('CONFIG_MANAGE')")
public class ConfigurationController {

    private final SchoolRepository schoolRepository;
    private final AdmissionsCycleRepository cycleRepository;
    private final GradeDeadlineRepository deadlineRepository;
    private final WorkflowConfigRepository workflowRepository;
    private final FormSectionRepository sectionRepository;
    private final FormFieldRepository fieldRepository;
    private final SchoolTerminologyRepository terminologyRepository;
    private final UserRepository userRepository;

    // ════════════════════════════════════════════════════════════════════════
    // 1. BRANDING
    // ════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/config/branding
     * Returns the current school's branding settings.
     */
    @GetMapping("/branding")
    public ResponseEntity<School> getBranding(Authentication auth) {
        return ResponseEntity.ok(resolveSchool(auth));
    }

    /**
     * PUT /api/v1/config/branding
     * Updates branding fields: logoUrl, faviconUrl, primaryColor, secondaryColor,
     * fontFamily, tagline, website, address, contactEmail, contactPhone, emailSignature.
     */
    @PutMapping("/branding")
    @Transactional
    public ResponseEntity<School> updateBranding(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        School school = resolveSchool(auth);
        if (body.containsKey("logoUrl"))        school.setLogoUrl(body.get("logoUrl"));
        if (body.containsKey("faviconUrl"))     school.setFaviconUrl(body.get("faviconUrl"));
        if (body.containsKey("primaryColor"))   school.setPrimaryColor(body.get("primaryColor"));
        if (body.containsKey("secondaryColor")) school.setSecondaryColor(body.get("secondaryColor"));
        if (body.containsKey("fontFamily"))     school.setFontFamily(body.get("fontFamily"));
        if (body.containsKey("tagline"))        school.setTagline(body.get("tagline"));
        if (body.containsKey("website"))        school.setWebsite(body.get("website"));
        if (body.containsKey("address"))        school.setAddress(body.get("address"));
        if (body.containsKey("contactEmail"))   school.setContactEmail(body.get("contactEmail"));
        if (body.containsKey("contactPhone"))   school.setContactPhone(body.get("contactPhone"));
        if (body.containsKey("emailSignature")) school.setEmailSignature(body.get("emailSignature"));
        return ResponseEntity.ok(schoolRepository.save(school));
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. ADMISSIONS CYCLES
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/cycles")
    public ResponseEntity<List<AdmissionsCycle>> listCycles(Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        return ResponseEntity.ok(cycleRepository.findBySchoolIdOrderByAcademicYearDesc(schoolId));
    }

    @GetMapping("/cycles/active")
    public ResponseEntity<AdmissionsCycle> getActiveCycle(Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        return cycleRepository.findBySchoolIdAndActiveTrue(schoolId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cycles/{id}")
    public ResponseEntity<AdmissionsCycle> getCycle(@PathVariable UUID id) {
        return cycleRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cycles")
    @Transactional
    public ResponseEntity<AdmissionsCycle> createCycle(
            @RequestBody AdmissionsCycle request,
            Authentication auth) {

        School school = resolveSchool(auth);
        request.setId(null);
        request.setSchool(school);

        // Only one active cycle at a time — deactivate current if activating this one
        if (Boolean.TRUE.equals(request.isActive())) {
            cycleRepository.findBySchoolIdAndActiveTrue(school.getId())
                    .ifPresent(existing -> { existing.setActive(false); cycleRepository.save(existing); });
        }

        return ResponseEntity.ok(cycleRepository.save(request));
    }

    @PutMapping("/cycles/{id}")
    @Transactional
    public ResponseEntity<AdmissionsCycle> updateCycle(
            @PathVariable UUID id,
            @RequestBody AdmissionsCycle request,
            Authentication auth) {

        AdmissionsCycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        UUID schoolId = resolveSchoolId(auth);
        if (!cycle.getSchool().getId().equals(schoolId)) return ResponseEntity.status(403).build();

        if (request.getName() != null)            cycle.setName(request.getName());
        if (request.getOpenDate() != null)        cycle.setOpenDate(request.getOpenDate());
        if (request.getCloseDate() != null)       cycle.setCloseDate(request.getCloseDate());
        if (request.getGeneralDeadline() != null) cycle.setGeneralDeadline(request.getGeneralDeadline());

        if (request.isActive() && !cycle.isActive()) {
            cycleRepository.findBySchoolIdAndActiveTrue(schoolId)
                    .ifPresent(existing -> { existing.setActive(false); cycleRepository.save(existing); });
            cycle.setActive(true);
        } else if (!request.isActive()) {
            cycle.setActive(false);
        }

        return ResponseEntity.ok(cycleRepository.save(cycle));
    }

    // ── Grade deadlines within a cycle ──────────────────────────────────────

    @GetMapping("/cycles/{cycleId}/deadlines")
    public ResponseEntity<List<GradeDeadline>> listDeadlines(@PathVariable UUID cycleId) {
        return ResponseEntity.ok(deadlineRepository.findByCycleId(cycleId));
    }

    @PostMapping("/cycles/{cycleId}/deadlines")
    @Transactional
    public ResponseEntity<GradeDeadline> upsertDeadline(
            @PathVariable UUID cycleId,
            @RequestBody GradeDeadline request) {

        AdmissionsCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        GradeDeadline deadline = deadlineRepository
                .findByCycleIdAndGrade(cycleId, request.getGrade())
                .orElse(GradeDeadline.builder().cycle(cycle).grade(request.getGrade()).build());

        if (request.getDeadline() != null) deadline.setDeadline(request.getDeadline());
        if (request.getCapacity() != null) deadline.setCapacity(request.getCapacity());
        return ResponseEntity.ok(deadlineRepository.save(deadline));
    }

    @DeleteMapping("/cycles/{cycleId}/deadlines/{id}")
    @Transactional
    public ResponseEntity<Void> deleteDeadline(@PathVariable UUID cycleId, @PathVariable UUID id) {
        if (!deadlineRepository.existsById(id)) return ResponseEntity.notFound().build();
        deadlineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. WORKFLOW CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/workflow")
    public ResponseEntity<List<WorkflowConfig>> listWorkflowConfigs(Authentication auth) {
        return ResponseEntity.ok(workflowRepository.findBySchoolId(resolveSchoolId(auth)));
    }

    @GetMapping("/workflow/default")
    public ResponseEntity<WorkflowConfig> getDefaultWorkflow(Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        return workflowRepository.findBySchoolIdAndGradeIsNull(schoolId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/config/workflow
     * Upserts a workflow rule for a specific grade (or school default if grade is null/omitted).
     */
    @PostMapping("/workflow")
    @Transactional
    public ResponseEntity<WorkflowConfig> upsertWorkflowConfig(
            @RequestBody WorkflowConfig request,
            Authentication auth) {

        School school = resolveSchool(auth);
        String grade = request.getGrade();

        WorkflowConfig config = (grade == null || grade.isBlank())
                ? workflowRepository.findBySchoolIdAndGradeIsNull(school.getId())
                        .orElse(WorkflowConfig.builder().school(school).build())
                : workflowRepository.findBySchoolIdAndGrade(school.getId(), grade)
                        .orElse(WorkflowConfig.builder().school(school).grade(grade).build());

        if (request.getInterviewRequirement() != null)
            config.setInterviewRequirement(request.getInterviewRequirement());
        config.setReviewRounds(request.getReviewRounds() > 0 ? request.getReviewRounds() : config.getReviewRounds());
        config.setCommitteeMinMembers(request.getCommitteeMinMembers() > 0
                ? request.getCommitteeMinMembers() : config.getCommitteeMinMembers());
        config.setPrincipalApprovalRequired(request.isPrincipalApprovalRequired());

        return ResponseEntity.ok(workflowRepository.save(config));
    }

    @DeleteMapping("/workflow/{id}")
    @Transactional
    public ResponseEntity<Void> deleteWorkflowConfig(@PathVariable UUID id) {
        if (!workflowRepository.existsById(id)) return ResponseEntity.notFound().build();
        workflowRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. FORM BUILDER — Sections
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/form/sections")
    public ResponseEntity<List<FormSection>> listSections(
            @RequestParam(defaultValue = "false") boolean enabledOnly,
            Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        return ResponseEntity.ok(enabledOnly
                ? sectionRepository.findBySchoolIdAndEnabledTrueOrderByDisplayOrderAsc(schoolId)
                : sectionRepository.findBySchoolIdOrderByDisplayOrderAsc(schoolId));
    }

    @PostMapping("/form/sections")
    public ResponseEntity<FormSection> createSection(
            @RequestBody FormSection request,
            Authentication auth) {
        request.setId(null);
        request.setSchool(resolveSchool(auth));
        return ResponseEntity.ok(sectionRepository.save(request));
    }

    @PutMapping("/form/sections/{id}")
    @Transactional
    public ResponseEntity<FormSection> updateSection(
            @PathVariable UUID id,
            @RequestBody FormSection request) {
        FormSection section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        if (request.getName() != null)        section.setName(request.getName());
        if (request.getDescription() != null) section.setDescription(request.getDescription());
        section.setDisplayOrder(request.getDisplayOrder());
        section.setEnabled(request.isEnabled());
        return ResponseEntity.ok(sectionRepository.save(section));
    }

    @DeleteMapping("/form/sections/{id}")
    @Transactional
    public ResponseEntity<Void> deleteSection(@PathVariable UUID id) {
        if (!sectionRepository.existsById(id)) return ResponseEntity.notFound().build();
        fieldRepository.deleteBySectionId(id);
        sectionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Form fields within a section ────────────────────────────────────────

    @GetMapping("/form/sections/{sectionId}/fields")
    public ResponseEntity<List<FormField>> listFields(
            @PathVariable UUID sectionId,
            @RequestParam(defaultValue = "false") boolean enabledOnly) {
        return ResponseEntity.ok(enabledOnly
                ? fieldRepository.findBySectionIdAndEnabledTrueOrderByDisplayOrderAsc(sectionId)
                : fieldRepository.findBySectionIdOrderByDisplayOrderAsc(sectionId));
    }

    @PostMapping("/form/sections/{sectionId}/fields")
    public ResponseEntity<FormField> createField(
            @PathVariable UUID sectionId,
            @RequestBody FormField request) {
        FormSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        request.setId(null);
        request.setSection(section);
        return ResponseEntity.ok(fieldRepository.save(request));
    }

    @PutMapping("/form/fields/{id}")
    @Transactional
    public ResponseEntity<FormField> updateField(
            @PathVariable UUID id,
            @RequestBody FormField request) {
        FormField field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found"));
        if (request.getLabel() != null)     field.setLabel(request.getLabel());
        if (request.getHelpText() != null)  field.setHelpText(request.getHelpText());
        if (request.getFieldType() != null) field.setFieldType(request.getFieldType());
        if (request.getOptions() != null)   field.setOptions(request.getOptions());
        field.setRequired(request.isRequired());
        field.setDisplayOrder(request.getDisplayOrder());
        field.setEnabled(request.isEnabled());
        return ResponseEntity.ok(fieldRepository.save(field));
    }

    @DeleteMapping("/form/fields/{id}")
    @Transactional
    public ResponseEntity<Void> deleteField(@PathVariable UUID id) {
        if (!fieldRepository.existsById(id)) return ResponseEntity.notFound().build();
        fieldRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. TERMINOLOGY
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/terminology")
    public ResponseEntity<List<SchoolTerminology>> listTerminology(
            @RequestParam(required = false) String language,
            Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        return ResponseEntity.ok(language != null && !language.isBlank()
                ? terminologyRepository.findBySchoolIdAndLanguage(schoolId, language)
                : terminologyRepository.findBySchoolId(schoolId));
    }

    /**
     * PUT /api/v1/config/terminology
     * Body: { "key": "application", "value": "Ubusabe", "language": "rw" }
     * Upserts the term override.
     */
    @PutMapping("/terminology")
    @Transactional
    public ResponseEntity<SchoolTerminology> upsertTerm(
            @RequestBody SchoolTerminology request,
            Authentication auth) {
        School school = resolveSchool(auth);
        SchoolTerminology term = terminologyRepository
                .findBySchoolIdAndKey(school.getId(), request.getKey())
                .orElse(SchoolTerminology.builder().school(school).key(request.getKey()).build());
        term.setValue(request.getValue());
        if (request.getLanguage() != null) term.setLanguage(request.getLanguage());
        return ResponseEntity.ok(terminologyRepository.save(term));
    }

    @DeleteMapping("/terminology/{key}")
    @Transactional
    public ResponseEntity<Void> deleteTerm(@PathVariable String key, Authentication auth) {
        UUID schoolId = resolveSchoolId(auth);
        terminologyRepository.deleteBySchoolIdAndKey(schoolId, key);
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // Helpers
    // ════════════════════════════════════════════════════════════════════════

    private School resolveSchool(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSchool() == null) throw new RuntimeException("User has no school assigned");
        return user.getSchool();
    }

    private UUID resolveSchoolId(Authentication auth) {
        return resolveSchool(auth).getId();
    }
}
