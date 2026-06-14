package com.iseas.ise_as_backend.model;

public enum EnrollmentStatus {
    PENDING_FORM,       // Offer accepted — awaiting parent form submission
    FORM_SUBMITTED,     // Parent submitted enrollment form — awaiting registrar review
    UNDER_REVIEW,       // Registrar is reviewing the enrollment package
    ENROLLED            // Registrar confirmed — student record created
}
