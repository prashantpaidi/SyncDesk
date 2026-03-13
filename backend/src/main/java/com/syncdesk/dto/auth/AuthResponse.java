package com.syncdesk.dto.auth;

public record AuthResponse(
        String token,
        String role,
        Long id,
        String name) {
}
