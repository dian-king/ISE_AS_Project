package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.NotificationChannel;
import com.iseas.ise_as_backend.model.NotificationEventType;
import com.iseas.ise_as_backend.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    Optional<NotificationTemplate> findByEventTypeAndChannelAndEnabledTrue(
            NotificationEventType eventType, NotificationChannel channel);
    List<NotificationTemplate> findByEventType(NotificationEventType eventType);
}
