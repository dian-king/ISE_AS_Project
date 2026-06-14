package com.iseas.ise_as_backend.model;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Canonical role-to-permission mapping for the platform.
 * Controllers and service layers use this via @PreAuthorize or RolePermissions.has().
 */
public final class RolePermissions {

    private static final Map<Role, Set<Permission>> MAP = new EnumMap<>(Role.class);

    static {
        MAP.put(Role.PARENT, EnumSet.of(
            Permission.APPLICATION_CREATE,
            Permission.APPLICATION_UPDATE,
            Permission.APPLICATION_VIEW,
            Permission.APPLICATION_SUBMIT,
            Permission.DOCUMENT_UPLOAD,
            Permission.DOCUMENT_VIEW,
            Permission.OFFER_ACCEPT
        ));

        MAP.put(Role.APPLICANT, EnumSet.of(
            Permission.APPLICATION_VIEW,
            Permission.DOCUMENT_VIEW
        ));

        MAP.put(Role.ADMISSIONS_OFFICER, EnumSet.of(
            Permission.APPLICATION_VIEW_ALL,
            Permission.APPLICATION_STATUS_CHANGE,
            Permission.STATUS_UPDATE,
            Permission.REVIEWER_ASSIGN,
            Permission.DOCUMENT_VIEW,
            Permission.DOCUMENT_VERIFY,
            Permission.DOCUMENT_DELETE,
            Permission.INTERVIEW_CREATE,
            Permission.INTERVIEW_ASSIGN,
            Permission.REVIEW_VIEW,
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT
        ));

        MAP.put(Role.REVIEWER, EnumSet.of(
            Permission.APPLICATION_VIEW,
            Permission.DOCUMENT_VIEW,
            Permission.REVIEW_CREATE,
            Permission.REVIEW_VIEW
        ));

        MAP.put(Role.INTERVIEWER, EnumSet.of(
            Permission.APPLICATION_VIEW,
            Permission.DOCUMENT_VIEW,
            Permission.INTERVIEW_EVALUATE,
            Permission.INTERVIEW_RECOMMENDATION
        ));

        MAP.put(Role.ADMISSIONS_COMMITTEE, EnumSet.of(
            Permission.APPLICATION_VIEW_ALL,
            Permission.DOCUMENT_VIEW,
            Permission.REVIEW_VIEW,
            Permission.REVIEW_APPROVE,
            Permission.DECISION_CREATE
        ));

        MAP.put(Role.PRINCIPAL, EnumSet.of(
            Permission.APPLICATION_VIEW_ALL,
            Permission.DOCUMENT_VIEW,
            Permission.REVIEW_VIEW,
            Permission.DECISION_CREATE,
            Permission.DECISION_APPROVE,
            Permission.DECISION_RELEASE,
            Permission.DECISION_OVERRIDE,
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT
        ));

        MAP.put(Role.REGISTRAR, EnumSet.of(
            Permission.APPLICATION_VIEW_ALL,
            Permission.DOCUMENT_VIEW,
            Permission.ENROLLMENT_MANAGE,
            Permission.STATUS_UPDATE,
            Permission.REPORT_VIEW
        ));

        Set<Permission> adminPerms = EnumSet.allOf(Permission.class);

        MAP.put(Role.SCHOOL_ADMINISTRATOR, adminPerms);
        MAP.put(Role.ADMINISTRATOR,        adminPerms);
        MAP.put(Role.SUPER_ADMIN,          adminPerms);
        MAP.put(Role.CODAFRIQA_SUPPORT,    adminPerms);
    }

    private RolePermissions() {}

    public static Set<Permission> forRole(Role role) {
        return MAP.getOrDefault(role, EnumSet.noneOf(Permission.class));
    }

    public static boolean has(Role role, Permission permission) {
        return forRole(role).contains(permission);
    }
}
