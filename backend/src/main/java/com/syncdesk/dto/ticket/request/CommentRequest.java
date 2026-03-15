package com.syncdesk.dto.ticket.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank
    private String content;

    /**
     * Align JSON property with frontend payload key `isVisibleToUser`.
     * Without this, Jackson expects `visibleToUser` and silently falls back to the default `true`.
     */
    @JsonProperty("isVisibleToUser")
    private boolean isVisibleToUser = true;
}
