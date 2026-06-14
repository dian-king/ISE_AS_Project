package com.iseas.ise_as_backend.model;

/**
 * All platform permissions. Every API action maps to one of these.
 * Role-to-permission assignments live in RolePermissions.
 */
public enum Permission {

    // ── Application ───────────────────────────────────────────────────────────
    APPLICATION_CREATE,
    APPLICATION_UPDATE,
    APPLICATION_VIEW,
    APPLICATION_VIEW_ALL,
    APPLICATION_SUBMIT,
    APPLICATION_DELETE,
    APPLICATION_STATUS_CHANGE,

    // ── Document ──────────────────────────────────────────────────────────────
    DOCUMENT_UPLOAD,
    DOCUMENT_VIEW,
    DOCUMENT_VERIFY,
    DOCUMENT_DELETE,

    // ── Review ────────────────────────────────────────────────────────────────
    REVIEW_CREATE,
    REVIEW_VIEW,
    REVIEW_APPROVE,
    REVIEWER_ASSIGN,

    // ── Interview ─────────────────────────────────────────────────────────────
    INTERVIEW_CREATE,
    INTERVIEW_ASSIGN,
    INTERVIEW_EVALUATE,
    INTERVIEW_RECOMMENDATION,

    // ── Decision ─────────────────────────────────────────────────────────────
    DECISION_CREATE,
    DECISION_APPROVE,
    DECISION_RELEASE,
    DECISION_OVERRIDE,

    // ── Offer ─────────────────────────────────────────────────────────────────
    OFFER_ACCEPT,

    // ── Enrollment ────────────────────────────────────────────────────────────
    ENROLLMENT_MANAGE,

    // ── Reporting ─────────────────────────────────────────────────────────────
    REPORT_VIEW,
    REPORT_EXPORT,

    // ── Administration ────────────────────────────────────────────────────────
    USER_MANAGE,
    ROLE_MANAGE,
    CONFIG_MANAGE,

    // ── Status changes ────────────────────────────────────────────────────────
    STATUS_UPDATE,

    // ── Notifications ─────────────────────────────────────────────────────────
    NOTIFICATION_MANAGE
}
