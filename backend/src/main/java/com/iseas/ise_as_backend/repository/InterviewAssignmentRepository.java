package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.InterviewAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InterviewAssignmentRepository extends JpaRepository<InterviewAssignment, UUID> {
    List<InterviewAssignment> findByInterviewId(UUID interviewId);
    List<InterviewAssignment> findByInterviewerId(UUID interviewerId);
    boolean existsByInterviewIdAndInterviewerId(UUID interviewId, UUID interviewerId);
}
