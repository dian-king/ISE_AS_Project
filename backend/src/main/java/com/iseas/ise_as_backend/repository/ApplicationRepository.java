package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Application;
import com.iseas.ise_as_backend.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findBySchoolId(UUID schoolId);

    List<Application> findByApplicantParentEmail(String parentEmail);

    Optional<Application> findByIdAndApplicantParentEmail(UUID id, String parentEmail);

    // BR-004: returns true if this parent already has a non-terminal application for the given year
    @Query("SELECT COUNT(a) > 0 FROM Application a " +
           "WHERE a.applicant.parent.email = :parentEmail " +
           "AND a.academicYear = :academicYear " +
           "AND a.status NOT IN :terminalStatuses")
    boolean existsActiveApplicationForParent(
            @Param("parentEmail") String parentEmail,
            @Param("academicYear") String academicYear,
            @Param("terminalStatuses") List<ApplicationStatus> terminalStatuses);

    // ── Reporting queries ─────────────────────────────────────────────────────

    /** Counts per status for a given school and academic year. */
    @Query("SELECT a.status, COUNT(a) FROM Application a " +
           "WHERE a.school.id = :schoolId AND a.academicYear = :academicYear " +
           "GROUP BY a.status")
    List<Object[]> countByStatusForSchool(@Param("schoolId") UUID schoolId,
                                          @Param("academicYear") String academicYear);

    /** Counts per grade for a given school and academic year. */
    @Query("SELECT a.gradeApplyingFor, COUNT(a) FROM Application a " +
           "WHERE a.school.id = :schoolId AND a.academicYear = :academicYear " +
           "GROUP BY a.gradeApplyingFor ORDER BY a.gradeApplyingFor")
    List<Object[]> countByGradeForSchool(@Param("schoolId") UUID schoolId,
                                          @Param("academicYear") String academicYear);

    /** Counts per nationality for a given school and academic year. */
    @Query("SELECT a.applicant.nationality, COUNT(a) FROM Application a " +
           "WHERE a.school.id = :schoolId AND a.academicYear = :academicYear " +
           "GROUP BY a.applicant.nationality ORDER BY COUNT(a) DESC")
    List<Object[]> countByNationalityForSchool(@Param("schoolId") UUID schoolId,
                                                @Param("academicYear") String academicYear);

    /** Count for a specific status. */
    @Query("SELECT COUNT(a) FROM Application a " +
           "WHERE a.school.id = :schoolId AND a.academicYear = :academicYear AND a.status = :status")
    long countBySchoolAndYearAndStatus(@Param("schoolId") UUID schoolId,
                                       @Param("academicYear") String academicYear,
                                       @Param("status") ApplicationStatus status);

    /** Total applications for school + year. */
    @Query("SELECT COUNT(a) FROM Application a WHERE a.school.id = :schoolId AND a.academicYear = :academicYear")
    long countBySchoolAndYear(@Param("schoolId") UUID schoolId, @Param("academicYear") String academicYear);

    /** Enrolled count per grade for a school + year. */
    @Query("SELECT a.gradeApplyingFor, COUNT(a) FROM Application a " +
           "WHERE a.school.id = :schoolId AND a.academicYear = :academicYear " +
           "AND a.status = :status " +
           "GROUP BY a.gradeApplyingFor")
    List<Object[]> enrolledCountByGrade(@Param("schoolId") UUID schoolId,
                                         @Param("academicYear") String academicYear,
                                         @Param("status") ApplicationStatus status);
}
