package com.iseas.ise_as_backend.repository;

import com.iseas.ise_as_backend.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OfferRepository extends JpaRepository<Offer, UUID> {
    Optional<Offer> findByApplicationId(UUID applicationId);
}
