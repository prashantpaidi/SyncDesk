package com.syncdesk.dto.user;

import com.syncdesk.enums.Role;
import lombok.Builder;

@Builder
public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}
