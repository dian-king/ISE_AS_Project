package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findBySchoolIdOrderByPerformedAtDesc(UUID schoolId, Pageable pageable);

    Page<AuditLog> findByActorEmailOrderByPerformedAtDesc(String actorEmail, Pageable pageable);

    Page<AuditLog> findBySchoolIdAndActorEmailOrderByPerformedAtDesc(UUID schoolId, String actorEmail, Pageable pageable);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtAsc(String entityType, String entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.schoolId = :schoolId " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:from IS NULL OR a.performedAt >= :from) " +
           "AND (:to IS NULL OR a.performedAt <= :to) " +
           "ORDER BY a.performedAt DESC")
    Page<AuditLog> search(
        @Param("schoolId") UUID schoolId,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

    long countBySchoolIdAndPerformedAtBetween(UUID schoolId, LocalDateTime from, LocalDateTime to);
}
