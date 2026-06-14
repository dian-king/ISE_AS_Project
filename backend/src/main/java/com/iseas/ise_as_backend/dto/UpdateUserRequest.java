package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.Role;
import com.iseas.ise_as_backend.model.UserStatus;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Role role;
    private UserStatus status;
    private String phoneNumber;
}
