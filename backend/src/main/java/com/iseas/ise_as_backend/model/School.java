package com.iseas.ise_as_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(unique = true)
    private String domain;

    private String logoUrl;
    private String primaryColor;
    private String secondaryColor;
    
    private String address;
    private String contactEmail;
    private String contactPhone;

    @Builder.Default
    private boolean active = true;
}
