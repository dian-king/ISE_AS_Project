package com.iseas.ise_as_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Application application;

    private String offerNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OfferStatus offerStatus = OfferStatus.PENDING;

    private LocalDateTime offerDate;
    private LocalDateTime expiryDate;
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        offerDate = LocalDateTime.now();
        if (expiryDate == null) {
            expiryDate = offerDate.plusDays(14);
        }
    }
}
