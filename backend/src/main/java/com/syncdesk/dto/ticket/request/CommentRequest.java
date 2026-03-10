package com.syncdesk.dto.ticket.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank
    private String content;

    private boolean isVisibleToUser = true;
}
