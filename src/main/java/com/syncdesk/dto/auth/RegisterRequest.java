package com.syncdesk.dto.auth;


import com.syncdesk.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        Role role  // default to CUSTOMER in service if null
) {}