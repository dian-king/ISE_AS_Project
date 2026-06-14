package com.iseas.ise_as_backend.dto;

import com.iseas.ise_as_backend.model.Role;
import lombok.Data;

@Data
public class CreateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String temporaryPassword;
    private String phoneNumber;
}
