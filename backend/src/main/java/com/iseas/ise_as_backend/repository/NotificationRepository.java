package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
