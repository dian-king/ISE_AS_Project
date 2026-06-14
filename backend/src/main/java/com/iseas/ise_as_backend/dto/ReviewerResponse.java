package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewerResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
}
